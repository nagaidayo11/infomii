import Stripe from "stripe";
import { resolveMaxPublishedPagesByPlan } from "@/lib/plan-limits";
import {
  getStripeBusinessAnnualPriceId,
  getStripeBusinessPriceId,
  getStripeProAnnualPriceId,
  getStripeProPriceId,
  getStripeServerClient,
} from "@/lib/server/stripe-server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

type PlanType = "free" | "pro" | "business";
type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export type StripeSubscriptionSyncResult = {
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  billingInterval: "monthly" | "yearly" | null;
};

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (status === "trialing") return "trialing";
  if (status === "active") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  return "canceled";
}

function mapPlanByPriceId(priceId: string | null): PlanType {
  if (!priceId) return "pro";
  try {
    if (priceId === getStripeBusinessPriceId()) return "business";
    const bizAnnual = getStripeBusinessAnnualPriceId();
    if (bizAnnual && priceId === bizAnnual) return "business";
    if (priceId === getStripeProPriceId()) return "pro";
    const proAnnual = getStripeProAnnualPriceId();
    if (proAnnual && priceId === proAnnual) return "pro";
  } catch {
    /* env not set */
  }
  return "pro";
}

function inferBillingInterval(priceId: string | null): "monthly" | "yearly" | null {
  if (!priceId) return null;
  try {
    const annualIds = [getStripeProAnnualPriceId(), getStripeBusinessAnnualPriceId()].filter(Boolean);
    return annualIds.includes(priceId) ? "yearly" : "monthly";
  } catch {
    return null;
  }
}

function toIsoOrNull(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds || Number.isNaN(unixSeconds)) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

function resolvePeriodEndFromSubscription(subscription: Stripe.Subscription): number | null {
  const subscriptionAny = subscription as Stripe.Subscription & {
    current_period_end?: number;
    current_period_end_at?: number;
    current_period?: { end?: number };
    items?: {
      data?: Array<{
        current_period_end?: number;
        current_period?: { end?: number };
      }>;
    };
  };
  const firstItem = subscriptionAny.items?.data?.[0];
  return (
    subscriptionAny.current_period_end ??
    subscriptionAny.current_period_end_at ??
    subscriptionAny.current_period?.end ??
    firstItem?.current_period_end ??
    firstItem?.current_period?.end ??
    null
  );
}

async function resolveCurrentPeriodEndIso(
  stripe: Stripe,
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const direct = resolvePeriodEndFromSubscription(subscription);
  if (direct) return toIsoOrNull(direct);

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;
  if (!customerId) return null;

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
    /* fallback below */
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      subscription: subscription.id,
      limit: 10,
    });
    const nowUnix = Math.floor(Date.now() / 1000);
    const candidateEnds = invoices.data
      .flatMap((inv) => inv.lines.data.map((line) => line.period?.end ?? null))
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
      .sort((a, b) => b - a);

    const future = candidateEnds.find((value) => value >= nowUnix) ?? null;
    if (future) return toIsoOrNull(future);
    return toIsoOrNull(candidateEnds[0] ?? null);
  } catch {
    return null;
  }
}

async function upsertStripeSubscription(params: {
  hotelId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  maxPublishedPages: number;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelAt?: string | null;
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
      billing_provider: params.plan === "free" ? null : "stripe",
      stripe_customer_id: params.stripeCustomerId ?? null,
      stripe_subscription_id: params.stripeSubscriptionId ?? null,
      stripe_price_id: params.stripePriceId ?? null,
      cancel_at_period_end: params.cancelAtPeriodEnd ?? false,
      cancel_at: params.cancelAt ?? null,
      current_period_end: params.currentPeriodEnd ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("hotel_id", params.hotelId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function syncStripeSubscriptionForHotel(
  hotelId: string,
): Promise<StripeSubscriptionSyncResult | null> {
  const admin = getSupabaseAdminServerClient();
  const stripe = getStripeServerClient();

  const { data: row, error } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id,stripe_customer_id")
    .eq("hotel_id", hotelId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const subscriptionId = row?.stripe_subscription_id ?? null;
  if (!subscriptionId) {
    return null;
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
  const mappedStatus = mapStripeStatus(stripeSubscription.status);
  const stripePriceId = stripeSubscription.items.data[0]?.price?.id ?? null;
  const mappedPlan = mappedStatus === "canceled" ? "free" : mapPlanByPriceId(stripePriceId);
  const currentPeriodEndIso = await resolveCurrentPeriodEndIso(stripe, stripeSubscription);

  await upsertStripeSubscription({
    hotelId,
    plan: mappedPlan,
    status: mappedStatus,
    maxPublishedPages: resolveMaxPublishedPagesByPlan(mappedPlan),
    stripeCustomerId:
      typeof stripeSubscription.customer === "string"
        ? stripeSubscription.customer
        : (row?.stripe_customer_id ?? null),
    stripeSubscriptionId: subscriptionId,
    stripePriceId,
    cancelAtPeriodEnd: Boolean(stripeSubscription.cancel_at_period_end),
    cancelAt: toIsoOrNull(stripeSubscription.cancel_at ?? null),
    currentPeriodEnd: currentPeriodEndIso,
  });

  return {
    plan: mappedPlan,
    status: mappedStatus,
    currentPeriodEnd: currentPeriodEndIso,
    billingInterval: inferBillingInterval(stripePriceId),
  };
}
