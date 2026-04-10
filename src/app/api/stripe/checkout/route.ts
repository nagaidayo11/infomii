import { NextRequest, NextResponse } from "next/server";
import {
  getStripeServerClient,
  getAppBaseUrl,
  getStripePriceIdByPlan,
  getStripeProAnnualPriceId,
  getStripeBusinessAnnualPriceId,
} from "@/lib/server/stripe-server";
import { getSupabaseAdminServerClient, getSupabaseAnonServerClient } from "@/lib/server/supabase-server";
import { sendOpsAlert } from "@/lib/server/ops-alert";

export const runtime = "nodejs";

type CheckoutRequestBody = {
  successPath?: unknown;
  cancelPath?: unknown;
  plan?: "pro" | "business";
  interval?: "monthly" | "yearly";
};

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

function normalizeInternalPath(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  return trimmed;
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
        await appendBillingLog(auditHotelId, "billing.checkout_failed", `Checkout失敗: ${ensureError.message}`);
      }
      return NextResponse.json({ message: ensureError.message }, { status: 500 });
    }

    const { data: sub } = await admin
      .from("subscriptions")
      .select("plan,status,stripe_customer_id")
      .eq("hotel_id", hotelId)
      .maybeSingle();

    if (
      (sub?.plan === "pro" || sub?.plan === "business") &&
      (sub.status === "active" || sub.status === "trialing")
    ) {
      const stripeCustomerId = sub.stripe_customer_id;
      if (stripeCustomerId) {
        const origin = request.headers.get("origin");
        const baseUrl = getAppBaseUrl(origin);
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: stripeCustomerId,
          return_url: `${baseUrl}/dashboard`,
        });
        if (auditHotelId) {
          await appendBillingLog(
            auditHotelId,
            "billing.checkout_redirected_to_portal",
            "Checkout要求をPortalへリダイレクトしました",
            { plan: sub.plan, status: sub.status, portalUrlReady: Boolean(portalSession.url) },
          );
        }
        return NextResponse.json({ url: portalSession.url, mode: "portal" });
      }
      if (auditHotelId) {
        await appendBillingLog(
          auditHotelId,
          "billing.checkout_blocked",
          "Checkout中止: 有料契約中だがStripe顧客情報が未設定",
        );
      }
      return NextResponse.json(
        { message: "有料契約が確認されました。請求情報の同期後に再度お試しください。" },
        { status: 400 },
      );
    }

    let requestBody: CheckoutRequestBody = {};
    try {
      requestBody = (await request.json()) as CheckoutRequestBody;
    } catch {
      requestBody = {};
    }

    const successPath = normalizeInternalPath(
      requestBody.successPath,
      "/dashboard?billing=success",
    );
    const cancelPath = normalizeInternalPath(
      requestBody.cancelPath,
      "/dashboard?billing=cancel",
    );
    const plan = requestBody.plan === "business" ? "business" : "pro";
    const interval = requestBody.interval === "yearly" ? "yearly" : "monthly";

    if (interval === "yearly") {
      const hasAnnual =
        plan === "business" ? getStripeBusinessAnnualPriceId() : getStripeProAnnualPriceId();
      if (!hasAnnual) {
        return NextResponse.json(
          { message: "年払いプランは現在準備中です" },
          { status: 400 },
        );
      }
    }

    const origin = request.headers.get("origin");
    const baseUrl = getAppBaseUrl(origin);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: getStripePriceIdByPlan(plan, interval), quantity: 1 }],
      success_url: `${baseUrl}${successPath}`,
      cancel_url: `${baseUrl}${cancelPath}`,
      customer_email: user.email ?? undefined,
      allow_promotion_codes: true,
      metadata: {
        hotel_id: hotelId,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          hotel_id: hotelId,
          user_id: user.id,
        },
      },
    });

    if (!session.url) {
      if (auditHotelId) {
        await appendBillingLog(auditHotelId, "billing.checkout_failed", "Checkout URLの生成に失敗しました");
      }
      return NextResponse.json({ message: "Checkout URLの生成に失敗しました" }, { status: 500 });
    }

    if (auditHotelId) {
      await appendBillingLog(auditHotelId, "billing.checkout_session_created", "Checkoutセッションを生成しました", {
        checkoutSessionId: session.id,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    await sendOpsAlert(
      "Billing Checkout Error",
      error instanceof Error ? error.message : "Checkout作成に失敗しました",
    );
    if (auditHotelId) {
      await appendBillingLog(
        auditHotelId,
        "billing.checkout_failed",
        `Checkout例外: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Checkout作成に失敗しました" },
      { status: 500 },
    );
  }
}
