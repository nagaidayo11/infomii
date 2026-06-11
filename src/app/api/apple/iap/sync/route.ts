import { NextRequest, NextResponse } from "next/server";
import {
  appendAppleBillingLog,
  getSubscriptionBillingState,
  upsertAppleSubscriptionFromTransaction,
} from "@/lib/server/apple-subscription-sync";
import {
  isAppleIapServerConfigured,
  resolveActiveAppleSubscriptionTransaction,
  resolveAppleTransaction,
  resolveAuthoritativeAppleSubscription,
  type AppleStoreEnvironment,
} from "@/lib/server/apple-store-server";
import { extractBearerToken, requireBillingOwner } from "@/lib/server/billing-auth";
import { sendOpsAlert } from "@/lib/server/ops-alert";

export const runtime = "nodejs";

type SyncRequestBody = {
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

    let body: SyncRequestBody = {};
    try {
      body = (await request.json()) as SyncRequestBody;
    } catch {
      body = {};
    }

    const transactionId =
      typeof body.transactionId === "string" ? body.transactionId.trim() : "";
    const signedTransactionInfo =
      typeof body.signedTransactionInfo === "string" ? body.signedTransactionInfo.trim() : "";
    const preferredEnvironment = parseEnvironment(body.environment);

    const billing = await getSubscriptionBillingState(hotelId);
    const lookupId =
      transactionId ||
      billing.appleOriginalTransactionId ||
      (signedTransactionInfo ? "client-jws" : "");

    if (!lookupId && !signedTransactionInfo) {
      return NextResponse.json(
        {
          message:
            "同期できる App Store 契約が見つかりません。設定の「購入を復元」をお試しください。",
        },
        { status: 400 },
      );
    }

    let transaction;
    let environment: AppleStoreEnvironment;

    if (signedTransactionInfo || (transactionId && transactionId !== "client-jws")) {
      const resolved = await resolveAppleTransaction({
        transactionId: transactionId === "client-jws" ? "" : transactionId,
        signedTransactionInfo,
        preferredEnvironment,
      });
      const authoritative = await resolveAuthoritativeAppleSubscription(resolved);
      transaction = authoritative.transaction;
      environment = authoritative.environment;
    } else {
      const active = await resolveActiveAppleSubscriptionTransaction({
        anyTransactionId: billing.appleOriginalTransactionId ?? lookupId,
        preferredEnvironment,
      });
      if (!active) {
        return NextResponse.json(
          { message: "有効な App Store サブスクリプションが見つかりませんでした" },
          { status: 404 },
        );
      }
      transaction = active.transaction;
      environment = active.environment;
    }

    const result = await upsertAppleSubscriptionFromTransaction({
      hotelId,
      transaction,
      environment,
      effectiveProductId: transaction.productId ?? null,
    });

    await appendAppleBillingLog({
      hotelId,
      action: "billing.apple_iap_synced",
      message: `Apple IAP を再同期しました（plan=${result.plan}, status=${result.status}）`,
      metadata: {
        productId: transaction.productId ?? null,
        originalTransactionId: transaction.originalTransactionId ?? null,
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
    await sendOpsAlert(
      "Apple IAP Sync Error",
      error instanceof Error ? error.message : "Apple IAP sync failed",
    );
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Apple IAP の同期に失敗しました" },
      { status: 500 },
    );
  }
}
