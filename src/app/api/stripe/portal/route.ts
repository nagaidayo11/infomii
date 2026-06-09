import { NextRequest, NextResponse } from "next/server";
import { getAppBaseUrl, getStripeServerClient } from "@/lib/server/stripe-server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { sendOpsAlert } from "@/lib/server/ops-alert";
import { isNativeAppBillingRequest, NATIVE_APP_STRIPE_BLOCKED_MESSAGE } from "@/lib/server/billing-auth";

export const runtime = "nodejs";

const OWNER_ONLY_BILLING_MESSAGE = "課金操作はオーナーのみ実行できます。オーナーに依頼してください。";

async function appendBillingLog(hotelId: string, action: string, message: string, metadata?: Record<string, unknown>) {
  const admin = getSupabaseAdminServerClient();
  await admin.from("audit_logs").insert({
    hotel_id: hotelId,
    actor_user_id: null,
    action,
    target_type: "subscription",
    message,
    metadata: metadata ?? {},
  });
}

export async function POST(request: NextRequest) {
  let auditHotelId: string | null = null;
  try {
    if (isNativeAppBillingRequest(request.headers.get("user-agent"))) {
      return NextResponse.json({ message: NATIVE_APP_STRIPE_BLOCKED_MESSAGE }, { status: 403 });
    }

    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";

    if (!token) {
      return NextResponse.json({ message: "認証トークンがありません" }, { status: 401 });
    }

    const anon = getSupabaseAnonServerClient();
    const admin = getSupabaseAdminServerClient();
    const stripe = getStripeServerClient();

    const {
      data: { user },
      error: userError,
    } = await anon.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ message: "認証に失敗しました" }, { status: 401 });
    }

    const { data: membership, error: memberError } = await admin
      .from("hotel_memberships")
      .select("hotel_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberError) {
      return NextResponse.json({ message: memberError.message }, { status: 400 });
    }
    const hotelId = membership?.hotel_id ?? null;
    if (!hotelId) {
      return NextResponse.json({ message: OWNER_ONLY_BILLING_MESSAGE }, { status: 403 });
    }
    auditHotelId = hotelId;

    const { data: hotel, error: hotelError } = await admin
      .from("hotels")
      .select("owner_user_id")
      .eq("id", hotelId)
      .maybeSingle();
    if (hotelError) {
      return NextResponse.json({ message: hotelError.message }, { status: 400 });
    }
    if (hotel?.owner_user_id !== user.id) {
      if (auditHotelId) {
        await appendBillingLog(
          auditHotelId,
          "billing.portal_blocked_non_owner",
          "Portal中止: 非オーナーによる課金操作",
          { actorUserId: user.id },
        );
      }
      return NextResponse.json({ message: OWNER_ONLY_BILLING_MESSAGE }, { status: 403 });
    }

    const { error: ensureError } = await admin.rpc("ensure_hotel_subscription", {
      target_hotel_id: hotelId,
    });

    if (ensureError) {
      if (auditHotelId) {
        await appendBillingLog(auditHotelId, "billing.portal_failed", `Portal失敗: ${ensureError.message}`);
      }
      return NextResponse.json({ message: ensureError.message }, { status: 500 });
    }

    const { data: subscription, error: subError } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("hotel_id", hotelId)
      .maybeSingle();

    if (subError) {
      if (auditHotelId) {
        await appendBillingLog(auditHotelId, "billing.portal_failed", `Portal失敗: ${subError.message}`);
      }
      return NextResponse.json({ message: subError.message }, { status: 500 });
    }

    const stripeCustomerId = subscription?.stripe_customer_id;
    if (!stripeCustomerId) {
      if (auditHotelId) {
        await appendBillingLog(auditHotelId, "billing.portal_blocked", "Portal開始不可: Stripe顧客情報が未設定");
      }
      return NextResponse.json(
        { message: "Stripe顧客情報が見つかりません。先にアップグレードを実行してください。" },
        { status: 400 },
      );
    }

    const origin = request.headers.get("origin");
    const baseUrl = getAppBaseUrl(origin);

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/dashboard`,
    });

    if (auditHotelId) {
      await appendBillingLog(auditHotelId, "billing.portal_session_created", "Customer Portalセッションを生成しました", {
        portalUrlReady: Boolean(session.url),
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    await sendOpsAlert(
      "Billing Portal Error",
      error instanceof Error ? error.message : "Customer Portal開始に失敗しました",
    );
    if (auditHotelId) {
      await appendBillingLog(
        auditHotelId,
        "billing.portal_failed",
        `Portal例外: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Customer Portal開始に失敗しました" },
      { status: 500 },
    );
  }
}
