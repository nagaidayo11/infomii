import { NextRequest, NextResponse } from "next/server";
import { getStripeServerClient } from "@/lib/server/stripe-server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { isOpsAdminUser } from "@/lib/server/ops-auth";

export const runtime = "nodejs";

type BillingLogRow = {
  id: string;
  action: string;
  message: string;
  created_at: string;
};

export async function GET(request: NextRequest) {
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

    const env = {
      supabasePublic: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseService: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      stripeSecret: Boolean(process.env.STRIPE_SECRET_KEY),
      stripePrice: Boolean(process.env.STRIPE_PRO_PRICE_ID),
      stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    };

    let stripeOk = false;
    let stripeMessage = "Stripe接続を確認していません";
    if (env.stripeSecret) {
      try {
        const stripe = getStripeServerClient();
        const account = await stripe.accounts.retrieve();
        stripeOk = true;
        stripeMessage = `接続OK (${account.id})`;
      } catch (error) {
        stripeOk = false;
        stripeMessage = error instanceof Error ? error.message : "Stripe接続に失敗しました";
      }
    } else {
      stripeMessage = "STRIPE_SECRET_KEY が未設定です";
    }

    if (!env.supabaseService) {
      return NextResponse.json({
        checkedAt: new Date().toISOString(),
        env,
        stripe: { ok: stripeOk, message: stripeMessage },
        membership: { ok: false, hotelId: null },
        billing: {
          ok: false,
          plan: null,
          status: null,
          hasStripeCustomer: false,
          lastSyncAt: null,
          webhookLastReceivedAt: null,
          funnel7d: {
            upgradeClicks: 0,
            checkoutSessions: 0,
            completedCheckouts: 0,
            clickToCheckoutRate: 0,
            checkoutToPaidRate: 0,
          },
          message: "SUPABASE_SERVICE_ROLE_KEY が未設定です",
        },
        onboarding: {
          totalPages: 0,
          publishedPages: 0,
          draftPages: 0,
          firstPublishedReady: false,
        },
        recentBillingLogs: [] as BillingLogRow[],
      });
    }

    const admin = getSupabaseAdminServerClient();
    const { data: membership } = await admin
      .from("hotel_memberships")
      .select("hotel_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const hotelId = membership?.hotel_id ?? null;
    if (!hotelId) {
      return NextResponse.json({
        checkedAt: new Date().toISOString(),
        env,
        stripe: { ok: stripeOk, message: stripeMessage },
        membership: { ok: false, hotelId: null },
        billing: {
          ok: false,
          plan: null,
          status: null,
          hasStripeCustomer: false,
          lastSyncAt: null,
          webhookLastReceivedAt: null,
          funnel7d: {
            upgradeClicks: 0,
            checkoutSessions: 0,
            completedCheckouts: 0,
            clickToCheckoutRate: 0,
            checkoutToPaidRate: 0,
          },
          message: "施設所属がありません（復旧アクションで再作成可能）",
        },
        onboarding: {
          totalPages: 0,
          publishedPages: 0,
          draftPages: 0,
          firstPublishedReady: false,
        },
        recentBillingLogs: [] as BillingLogRow[],
      });
    }
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [{ data: sub }, { count: totalPages }, { count: publishedPages }, { count: draftPages }, { data: logs }, { data: funnelLogs }] = await Promise.all([
      admin
        .from("subscriptions")
        .select("plan,status,stripe_customer_id,updated_at")
        .eq("hotel_id", hotelId)
        .maybeSingle(),
      admin
        .from("informations")
        .select("id", { count: "exact", head: true })
        .eq("hotel_id", hotelId),
      admin
        .from("informations")
        .select("id", { count: "exact", head: true })
        .eq("hotel_id", hotelId)
        .eq("status", "published"),
      admin
        .from("informations")
        .select("id", { count: "exact", head: true })
        .eq("hotel_id", hotelId)
        .eq("status", "draft"),
      admin
        .from("audit_logs")
        .select("id,action,message,created_at")
        .eq("hotel_id", hotelId)
        .ilike("action", "billing.%")
        .order("created_at", { ascending: false })
        .limit(10),
      admin
        .from("audit_logs")
        .select("action,created_at")
        .eq("hotel_id", hotelId)
        .gte("created_at", since7d)
        .in("action", ["billing.upgrade_click", "billing.checkout_session_created", "billing.checkout_completed"]),
    ]);
    const webhookLastReceivedAt = (logs ?? [])
      .filter(
        (row) =>
          row.action === "billing.checkout_completed" ||
          row.action === "billing.subscription_synced",
      )
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      ?.created_at ?? null;

    const hasStripeCustomer = Boolean(sub?.stripe_customer_id);
    const billingOk = Boolean(
      sub && env.stripeSecret && env.stripeWebhook && (sub.plan !== "pro" || hasStripeCustomer),
    );
    const upgradeClicks = (funnelLogs ?? []).filter((row) => row.action === "billing.upgrade_click").length;
    const checkoutSessions = (funnelLogs ?? []).filter((row) => row.action === "billing.checkout_session_created").length;
    const completedCheckouts = (funnelLogs ?? []).filter((row) => row.action === "billing.checkout_completed").length;
    const clickToCheckoutRate = upgradeClicks > 0 ? Math.round((checkoutSessions / upgradeClicks) * 100) : 0;
    const checkoutToPaidRate = checkoutSessions > 0 ? Math.round((completedCheckouts / checkoutSessions) * 100) : 0;

    return NextResponse.json({
      checkedAt: new Date().toISOString(),
      env,
      stripe: { ok: stripeOk, message: stripeMessage },
      membership: { ok: true, hotelId },
      billing: {
        ok: billingOk,
        plan: sub?.plan ?? null,
        status: sub?.status ?? null,
        hasStripeCustomer,
        lastSyncAt: sub?.updated_at ?? null,
        webhookLastReceivedAt,
        funnel7d: {
          upgradeClicks,
          checkoutSessions,
          completedCheckouts,
          clickToCheckoutRate,
          checkoutToPaidRate,
        },
        message: billingOk
          ? "課金設定は正常です"
          : "課金設定に不足があります（Webhook / 顧客ID / キーを確認）",
      },
      onboarding: {
        totalPages: totalPages ?? 0,
        publishedPages: publishedPages ?? 0,
        draftPages: draftPages ?? 0,
        firstPublishedReady: (publishedPages ?? 0) > 0,
      },
      recentBillingLogs: (logs ?? []) as BillingLogRow[],
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "運用ヘルス取得に失敗しました" },
      { status: 500 },
    );
  }
}
