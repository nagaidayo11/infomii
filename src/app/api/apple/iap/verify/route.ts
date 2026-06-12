import { NextRequest, NextResponse } from "next/server";
import {
  appendAppleBillingLog,
  AppleTransactionLinkedToOtherHotelError,
  EXTERNAL_BILLING_MANAGED_MESSAGE,
  getSubscriptionBillingState,
  isPaidSubscriptionActive,
  reconcileStripeSubscriptionIfPresent,
  upsertAppleSubscriptionFromTransaction,
} from "@/lib/server/apple-subscription-sync";
import {
  isAppleIapServerConfigured,
  resolveAppleTransaction,
  resolveAuthoritativeAppleSubscription,
  type AppleStoreEnvironment,
} from "@/lib/server/apple-store-server";
import { extractBearerToken, requireBillingOwner } from "@/lib/server/billing-auth";
import { sendOpsAlert } from "@/lib/server/ops-alert";

export const runtime = "nodejs";

type VerifyRequestBody = {
  transactionId?: unknown;
  signedTransactionInfo?: unknown;
  environment?: unknown;
};

function parseEnvironment(value: unknown): AppleStoreEnvironment | undefined {
  if (value === "Sandbox" || value === "sandbox") return "Sandbox";
  if (value === "Production" || value === "production") return "Production";
  return undefined;
}

export async function POST(request: NextRequest) {
  let hotelId: string | null = null;
  let body: VerifyRequestBody = {};

  try {
    if (!isAppleIapServerConfigured()) {
      return NextResponse.json(
        { message: "Apple IAP のサーバー設定が未完了です" },
        { status: 503 },
      );
    }

    const auth = await requireBillingOwner(
      extractBearerToken(request.headers.get("authorization")),
    );
    if (!auth.ok) {
      return NextResponse.json({ message: auth.message }, { status: auth.status });
    }
    hotelId = auth.hotelId;

    try {
      body = (await request.json()) as VerifyRequestBody;
    } catch {
      body = {};
    }

    const transactionId =
      typeof body.transactionId === "string" ? body.transactionId.trim() : "";
    const signedTransactionInfo =
      typeof body.signedTransactionInfo === "string" ? body.signedTransactionInfo.trim() : "";
    if (!transactionId && !signedTransactionInfo) {
      return NextResponse.json(
        { message: "transactionId または signedTransactionInfo が必要です" },
        { status: 400 },
      );
    }

    const stripeSynced = await reconcileStripeSubscriptionIfPresent(hotelId);
    if (stripeSynced && isPaidSubscriptionActive(stripeSynced.plan, stripeSynced.status)) {
      return NextResponse.json(
        { message: EXTERNAL_BILLING_MANAGED_MESSAGE },
        { status: 409 },
      );
    }

    const billing = await getSubscriptionBillingState(hotelId);
    if (
      billing.billingProvider === "stripe" &&
      isPaidSubscriptionActive(billing.plan, billing.status)
    ) {
      return NextResponse.json(
        { message: EXTERNAL_BILLING_MANAGED_MESSAGE },
        { status: 409 },
      );
    }

    const preferredEnvironment = parseEnvironment(body.environment);
    const resolved = await resolveAppleTransaction({
      transactionId,
      signedTransactionInfo,
      preferredEnvironment,
    });
    const { transaction, environment } = await resolveAuthoritativeAppleSubscription(resolved);

    const result = await upsertAppleSubscriptionFromTransaction({
      hotelId,
      transaction,
      environment,
    });

    await appendAppleBillingLog({
      hotelId,
      action: "billing.apple_iap_verified",
      message: `Apple IAP を同期しました（plan=${result.plan}, status=${result.status}）`,
      metadata: {
        transactionId,
        originalTransactionId: transaction.originalTransactionId ?? null,
        productId: transaction.productId ?? null,
        environment,
      },
    });

    return NextResponse.json({
      ok: true,
      plan: result.plan,
      status: result.status,
      productId: transaction.productId ?? null,
      originalTransactionId: transaction.originalTransactionId ?? null,
      currentPeriodEnd: transaction.expiresDate
        ? new Date(transaction.expiresDate).toISOString()
        : null,
    });
  } catch (error) {
    if (error instanceof AppleTransactionLinkedToOtherHotelError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    await sendOpsAlert(
      "Apple IAP Verify Error",
      error instanceof Error ? error.message : "Apple IAP verification failed",
    );
    if (hotelId) {
      await appendAppleBillingLog({
        hotelId,
        action: "billing.apple_iap_verify_failed",
        message: `Apple IAP 検証失敗: ${error instanceof Error ? error.message : "unknown"}`,
        metadata: {
          transactionId: typeof body?.transactionId === "string" ? body.transactionId : null,
          hasSignedTransactionInfo:
            typeof body?.signedTransactionInfo === "string" && body.signedTransactionInfo.length > 0,
          environment: typeof body?.environment === "string" ? body.environment : null,
        },
      });
    }
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Apple IAP の検証に失敗しました" },
      { status: 500 },
    );
  }
}
