import { NextRequest, NextResponse } from "next/server";
import {
  appendAppleBillingLog,
  findHotelIdByAppleOriginalTransactionId,
  upsertAppleSubscriptionFromTransaction,
} from "@/lib/server/apple-subscription-sync";
import { decodeAppleNotification, isAppleIapServerConfigured } from "@/lib/server/apple-store-server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";
import { sendOpsAlert } from "@/lib/server/ops-alert";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!isAppleIapServerConfigured()) {
      return NextResponse.json({ message: "Apple IAP not configured" }, { status: 503 });
    }

    const body = (await request.json()) as { signedPayload?: string };
    const signedPayload = body.signedPayload?.trim();
    if (!signedPayload) {
      return NextResponse.json({ message: "signedPayload is required" }, { status: 400 });
    }

    const notification = await decodeAppleNotification(signedPayload);
    const transaction = notification.transaction;
    if (!transaction?.originalTransactionId) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const originalTransactionId = transaction.originalTransactionId;
    let hotelId = await findHotelIdByAppleOriginalTransactionId(originalTransactionId);

    if (!hotelId) {
      const admin = getSupabaseAdminServerClient();
      const { data } = await admin
        .from("subscriptions")
        .select("hotel_id")
        .eq("apple_original_transaction_id", transaction.transactionId ?? "")
        .maybeSingle();
      hotelId = data?.hotel_id ?? null;
    }

    if (!hotelId) {
      return NextResponse.json({ received: true, unmatched: true });
    }

    await upsertAppleSubscriptionFromTransaction({
      hotelId,
      transaction,
      environment: notification.environment,
    });

    await appendAppleBillingLog({
      hotelId,
      action: "billing.apple_notification_synced",
      message: `Apple 通知を同期しました（${notification.notificationType ?? "unknown"}）`,
      metadata: {
        notificationType: notification.notificationType ?? null,
        subtype: notification.subtype ?? null,
        originalTransactionId,
        productId: transaction.productId ?? null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    await sendOpsAlert(
      "Apple Webhook Error",
      error instanceof Error ? error.message : "Apple webhook failed",
    );
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 500 },
    );
  }
}
