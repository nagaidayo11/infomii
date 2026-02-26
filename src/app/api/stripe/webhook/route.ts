import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { getStripeServerClient, getStripeWebhookSecret } from "@/lib/server/stripe-server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";
import { sendOpsAlert } from "@/lib/server/ops-alert";

export const runtime = "nodejs";

function mapStripeStatus(status: Stripe.Subscription.Status): "trialing" | "active" | "past_due" | "canceled" {
  if (status === "trialing") {
    return "trialing";
  }
  if (status === "active") {
    return "active";
  }
  if (status === "past_due" || status === "unpaid") {
    return "past_due";
  }
  return "canceled";
}

function mapPlanByStatus(status: Stripe.Subscription.Status): "free" | "pro" {
  if (status === "active" || status === "trialing" || status === "past_due" || status === "unpaid") {
    return "pro";
  }
  return "free";
}

function toIsoOrNull(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds || Number.isNaN(unixSeconds)) {
    return null;
  }
  return new Date(unixSeconds * 1000).toISOString();
}

function resolvePeriodEndFromSubscription(subscription: Stripe.Subscription): number | null {
  const subscriptionAny = subscription as Stripe.Subscription & {
    current_period_end?: number;
    current_period_end_at?: number;
    current_period?: { end?: number };
  };
  return (
    subscriptionAny.current_period_end ??
    subscriptionAny.current_period_end_at ??
    subscriptionAny.current_period?.end ??
    null
  );
}

async function resolveCurrentPeriodEndIso(
  stripe: Stripe,
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const direct = resolvePeriodEndFromSubscription(subscription);
  if (direct) {
    return toIsoOrNull(direct);
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;
  if (!customerId) {
    return null;
  }

  try {
    const upcomingInvoice = await stripe.invoices.createPreview({
      customer: customerId,
      subscription: subscription.id,
    });
    const upcomingAny = upcomingInvoice as Stripe.Invoice & {
      period_end?: number;
      lines?: { data?: Array<{ period?: { end?: number } }> };
    };
    const invoicePeriodEnd =
      upcomingAny.period_end ?? upcomingAny.lines?.data?.[0]?.period?.end ?? null;
    return toIsoOrNull(invoicePeriodEnd);
  } catch {
    return null;
  }
}

async function findHotelIdBySubscriptionId(subscriptionId: string): Promise<string | null> {
  const admin = getSupabaseAdminServerClient();
  const { data } = await admin
    .from("subscriptions")
    .select("hotel_id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  return data?.hotel_id ?? null;
}

async function upsertStripeSubscription(params: {
  hotelId: string;
  plan: "free" | "pro";
  status: "trialing" | "active" | "past_due" | "canceled";
  maxPublishedPages: number;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  currentPeriodEnd?: string | null;
}) {
  const admin = getSupabaseAdminServerClient();

  await admin.rpc("ensure_hotel_subscription", {
    target_hotel_id: params.hotelId,
  });

  const { error } = await admin
    .from("subscriptions")
    .update({
      plan: params.plan,
      status: params.status,
      max_published_pages: params.maxPublishedPages,
      stripe_customer_id: params.stripeCustomerId ?? null,
      stripe_subscription_id: params.stripeSubscriptionId ?? null,
      stripe_price_id: params.stripePriceId ?? null,
      current_period_end: params.currentPeriodEnd ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("hotel_id", params.hotelId);

  if (error) {
    throw new Error(error.message);
  }
}

async function appendBillingLog(params: {
  hotelId: string;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const admin = getSupabaseAdminServerClient();
  await admin.from("audit_logs").insert({
    hotel_id: params.hotelId,
    actor_user_id: null,
    action: params.action,
    target_type: "subscription",
    message: params.message,
    metadata: params.metadata ?? {},
  });
}

export async function POST(request: NextRequest) {
  let eventType = "unknown";
  let eventId = "unknown";
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      await sendOpsAlert("Billing Alert", "Stripe webhook rejected: missing stripe-signature header");
      return NextResponse.json({ message: "署名がありません" }, { status: 400 });
    }

    const stripe = getStripeServerClient();
    const webhookSecret = getStripeWebhookSecret();
    const body = await request.text();

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    eventType = event.type;
    eventId = event.id;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription") {
        const hotelId = session.metadata?.hotel_id;
        if (hotelId) {
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
          let currentPeriodEndIso: string | null = null;
          let mappedStatus: "trialing" | "active" | "past_due" | "canceled" = "active";
          let mappedPlan: "free" | "pro" = "pro";
          let stripePriceId: string | null = null;

          if (subscriptionId) {
            const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
            mappedStatus = mapStripeStatus(stripeSubscription.status);
            mappedPlan = mapPlanByStatus(stripeSubscription.status);
            stripePriceId = stripeSubscription.items.data[0]?.price?.id ?? null;
            currentPeriodEndIso = await resolveCurrentPeriodEndIso(stripe, stripeSubscription);
          }

          await upsertStripeSubscription({
            hotelId,
            plan: mappedPlan,
            status: mappedStatus,
            maxPublishedPages: mappedPlan === "pro" ? 1000 : 3,
            stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
            stripeSubscriptionId: subscriptionId,
            stripePriceId,
            currentPeriodEnd: currentPeriodEndIso,
          });
          await appendBillingLog({
            hotelId,
            action: "billing.checkout_completed",
            message: "Checkout完了イベントを処理しました（契約情報を同期）",
            metadata: { eventId, eventType, stripeSubscriptionId: subscriptionId },
          });
        }
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      let hotelId: string | null = subscription.metadata?.hotel_id ?? null;
      if (!hotelId) {
        hotelId = await findHotelIdBySubscriptionId(subscription.id);
      }

      if (hotelId) {
        const mappedStatus = mapStripeStatus(subscription.status);
        const mappedPlan = mapPlanByStatus(subscription.status);
        const firstItem = subscription.items.data[0];
        const currentPeriodEndIso = await resolveCurrentPeriodEndIso(stripe, subscription);

        await upsertStripeSubscription({
          hotelId,
          plan: mappedPlan,
          status: mappedStatus,
          maxPublishedPages: mappedPlan === "pro" ? 1000 : 3,
          stripeCustomerId:
            typeof subscription.customer === "string" ? subscription.customer : null,
          stripeSubscriptionId: subscription.id,
          stripePriceId: firstItem?.price?.id ?? null,
          currentPeriodEnd: currentPeriodEndIso,
        });
        await appendBillingLog({
          hotelId,
          action: "billing.subscription_synced",
          message: `サブスクリプション同期を実行しました（status=${mappedStatus}, plan=${mappedPlan}）`,
          metadata: { eventId, eventType, stripeSubscriptionId: subscription.id },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook処理に失敗しました";
    await sendOpsAlert(
      "Billing Alert",
      `Stripe webhook failed\nEvent: ${eventType}\nEvent ID: ${eventId}\nError: ${message}`,
    );
    return NextResponse.json(
      { message },
      { status: 400 },
    );
  }
}
