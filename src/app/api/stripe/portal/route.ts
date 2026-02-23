import { NextRequest, NextResponse } from "next/server";
import { getAppBaseUrl, getStripeServerClient } from "@/lib/server/stripe-server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { sendOpsAlert } from "@/lib/server/ops-alert";

export const runtime = "nodejs";

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

    let hotelId = membership?.hotel_id ?? null;

    if (!hotelId) {
      hotelId = crypto.randomUUID();

      const { error: createHotelError } = await admin.from("hotels").insert({
        id: hotelId,
        name: buildDefaultHotelName(user.email),
        owner_user_id: user.id,
      });

      if (createHotelError) {
        return NextResponse.json({ message: createHotelError.message }, { status: 400 });
      }

      const { error: createMembershipError } = await admin
        .from("hotel_memberships")
        .insert({ user_id: user.id, hotel_id: hotelId });

      if (createMembershipError) {
        return NextResponse.json({ message: createMembershipError.message }, { status: 400 });
      }
    }
    auditHotelId = hotelId;

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
