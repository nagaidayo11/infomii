import { NextRequest, NextResponse } from "next/server";
import { extractBearerToken, requireBillingOwner } from "@/lib/server/billing-auth";
import { syncStripeSubscriptionForHotel } from "@/lib/server/stripe-subscription-sync";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireBillingOwner(
      extractBearerToken(request.headers.get("authorization")),
    );
    if (!auth.ok) {
      return NextResponse.json({ message: auth.message }, { status: auth.status });
    }

    const result = await syncStripeSubscriptionForHotel(auth.hotelId);
    if (!result) {
      return NextResponse.json(
        { message: "Stripe サブスクリプションを同期できませんでした" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      plan: result.plan,
      status: result.status,
      currentPeriodEnd: result.currentPeriodEnd,
      billingInterval: result.billingInterval,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Stripe 同期に失敗しました" },
      { status: 500 },
    );
  }
}
