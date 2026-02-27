import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { getStripeServerClient } from "@/lib/server/stripe-server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { sendOpsAlert } from "@/lib/server/ops-alert";
import { isOpsAdminUser } from "@/lib/server/ops-auth";

export const runtime = "nodejs";

type RecoverAction = "ensure_scope" | "sync_subscription";

function buildDefaultHotelName(email: string | null | undefined): string {
  if (!email) {
    return "My Store";
  }
  const label = email.split("@")[0]?.trim();
  if (!label) {
    return "My Store";
  }
  return `${label} Store`;
}

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
    // Fallback to latest invoice history when upcoming preview is unavailable.
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
    if (future) {
      return toIsoOrNull(future);
    }

    return toIsoOrNull(candidateEnds[0] ?? null);
  } catch {
    return null;
  }
}

async function ensureHotelScope(userId: string, email: string | null | undefined): Promise<string> {
  const admin = getSupabaseAdminServerClient();
  const { data: membership } = await admin
    .from("hotel_memberships")
    .select("hotel_id")
    .eq("user_id", userId)
    .maybeSingle();

  let hotelId = membership?.hotel_id ?? null;
  if (!hotelId) {
    hotelId = crypto.randomUUID();
    const { error: createHotelError } = await admin.from("hotels").insert({
      id: hotelId,
      name: buildDefaultHotelName(email),
      owner_user_id: userId,
    });
    if (createHotelError) {
      throw new Error(createHotelError.message);
    }

    const { error: createMembershipError } = await admin
      .from("hotel_memberships")
      .insert({ user_id: userId, hotel_id: hotelId });
    if (createMembershipError) {
      throw new Error(createMembershipError.message);
    }
  }

  const { error: ensureError } = await admin.rpc("ensure_hotel_subscription", {
    target_hotel_id: hotelId,
  });
  if (ensureError) {
    throw new Error(ensureError.message);
  }

  return hotelId;
}

async function appendOpsLog(hotelId: string, action: string, message: string, metadata?: Record<string, unknown>) {
  const admin = getSupabaseAdminServerClient();
  await admin.from("audit_logs").insert({
    hotel_id: hotelId,
    actor_user_id: null,
    action,
    target_type: "ops",
    message,
    metadata: metadata ?? {},
  });
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";
    if (!token) {
      return NextResponse.json({ message: "認証トークンがありません" }, { status: 401 });
    }

    const anon = getSupabaseAnonServerClient();
    const {
      data: { user },
      error: userError,
    } = await anon.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ message: "認証に失敗しました" }, { status: 401 });
    }
    if (!isOpsAdminUser(user)) {
      return NextResponse.json({ message: "運用センターへのアクセス権限がありません" }, { status: 403 });
    }

    const payload = (await request.json().catch(() => ({}))) as { action?: RecoverAction };
    const action = payload.action;

    if (action !== "ensure_scope" && action !== "sync_subscription") {
      return NextResponse.json({ message: "不正な action です" }, { status: 400 });
    }

    const hotelId = await ensureHotelScope(user.id, user.email);
    const admin = getSupabaseAdminServerClient();

    if (action === "ensure_scope") {
      await appendOpsLog(
        hotelId,
        "ops.recovery_scope",
        "復旧操作: 施設所属とサブスクリプション初期化を実行しました",
      );
      return NextResponse.json({
        ok: true,
        action,
        hotelId,
        message: "施設所属の再同期が完了しました",
      });
    }

    const { data: sub, error: subError } = await admin
      .from("subscriptions")
      .select("stripe_subscription_id,stripe_customer_id")
      .eq("hotel_id", hotelId)
      .maybeSingle();
    if (subError) {
      return NextResponse.json({ message: subError.message }, { status: 500 });
    }
    const stripe = getStripeServerClient();
    let stripeSub: Stripe.Subscription | null = null;
    if (sub?.stripe_subscription_id) {
      stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
    } else if (sub?.stripe_customer_id) {
      const list = await stripe.subscriptions.list({
        customer: sub.stripe_customer_id,
        status: "all",
        limit: 10,
      });
      stripeSub =
        list.data.find((entry) => entry.status === "active" || entry.status === "trialing") ??
        list.data[0] ??
        null;
    }
    if (!stripeSub) {
      return NextResponse.json(
        { message: "Stripeサブスクリプションを特定できませんでした。Checkoutを再実行してください。" },
        { status: 400 },
      );
    }
    const plan = mapPlanByStatus(stripeSub.status);
    const status = mapStripeStatus(stripeSub.status);
    const firstItem = stripeSub.items.data[0];
    const currentPeriodEndIso = await resolveCurrentPeriodEndIso(stripe, stripeSub);

    const { error: updateError } = await admin
      .from("subscriptions")
      .update({
        plan,
        status,
        max_published_pages: plan === "pro" ? 1000 : 3,
        stripe_customer_id: typeof stripeSub.customer === "string" ? stripeSub.customer : null,
        stripe_subscription_id: stripeSub.id,
        stripe_price_id: firstItem?.price?.id ?? null,
        current_period_end: currentPeriodEndIso,
        updated_at: new Date().toISOString(),
      })
      .eq("hotel_id", hotelId);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    await appendOpsLog(
      hotelId,
      "billing.manual_sync",
      `復旧操作: Stripe手動同期を実行しました（status=${status}, plan=${plan}）`,
      { status, plan, stripeSubscriptionId: stripeSub.id },
    );

    return NextResponse.json({
      ok: true,
      action,
      hotelId,
      message: "Stripeサブスクリプションの手動同期が完了しました",
      plan,
      status,
    });
  } catch (error) {
    await sendOpsAlert(
      "Ops Recovery Error",
      error instanceof Error ? error.message : "復旧操作に失敗しました",
    );
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "復旧操作に失敗しました" },
      { status: 500 },
    );
  }
}
