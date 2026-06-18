import { mapAppleProductIdToPlan } from "@/lib/apple-iap-products";
import { resolveMaxPublishedPagesByPlan } from "@/lib/plan-limits";
import {
  syncStripeSubscriptionForHotel,
  type StripeSubscriptionSyncResult,
} from "@/lib/server/stripe-subscription-sync";
import { ensureHotelSubscriptionRpc } from "@/lib/server/private-supabase-rpc";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";
import { updateHotelSubscription } from "@/lib/server/subscription-update";
import {
  mapAppleTransactionStatus,
  transactionPeriodEndIso,
  type AppleStoreEnvironment,
} from "@/lib/server/apple-store-server";
import type { JWSTransactionDecodedPayload } from "@apple/app-store-server-library";

export const EXTERNAL_BILLING_MANAGED_MESSAGE =
  "現在のご契約はプラン画面から変更・解約できます。";

export class AppleTransactionLinkedToOtherHotelError extends Error {
  constructor() {
    super(
      "この App Store の購入は別の Infomii アカウントに紐づいています。購入時と同じアカウントでログインしてください。",
    );
    this.name = "AppleTransactionLinkedToOtherHotelError";
  }
}

function isAppleOriginalTransactionIdConflict(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("subscriptions_apple_original_transaction_id_key") ||
    message.includes("duplicate key value violates unique constraint")
  );
}

type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";
type PlanType = "free" | "pro" | "business";

export async function findHotelIdByAppleOriginalTransactionId(
  originalTransactionId: string,
): Promise<string | null> {
  const admin = getSupabaseAdminServerClient();
  const { data } = await admin
    .from("subscriptions")
    .select("hotel_id")
    .eq("apple_original_transaction_id", originalTransactionId)
    .maybeSingle();
  return data?.hotel_id ?? null;
}

export async function getSubscriptionBillingState(hotelId: string): Promise<{
  plan: PlanType;
  status: SubscriptionStatus;
  billingProvider: "stripe" | "apple" | null;
  stripeCustomerId: string | null;
  appleOriginalTransactionId: string | null;
}> {
  const admin = getSupabaseAdminServerClient();
  const { data, error } = await admin
    .from("subscriptions")
    .select(
      "plan,status,billing_provider,stripe_customer_id,apple_original_transaction_id",
    )
    .eq("hotel_id", hotelId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return {
    plan: (data?.plan as PlanType) ?? "free",
    status: (data?.status as SubscriptionStatus) ?? "active",
    billingProvider: (data?.billing_provider as "stripe" | "apple" | null) ?? null,
    stripeCustomerId: data?.stripe_customer_id ?? null,
    appleOriginalTransactionId: data?.apple_original_transaction_id ?? null,
  };
}

export function isPaidSubscriptionActive(
  plan: PlanType,
  status: SubscriptionStatus,
): boolean {
  return (plan === "pro" || plan === "business") && (status === "active" || status === "trialing");
}

export async function assertAppleTransactionForHotel(
  hotelId: string,
  originalTransactionId: string | null | undefined,
): Promise<void> {
  if (!originalTransactionId) return;
  const linkedHotelId = await findHotelIdByAppleOriginalTransactionId(originalTransactionId);
  if (linkedHotelId && linkedHotelId !== hotelId) {
    throw new AppleTransactionLinkedToOtherHotelError();
  }
}

/** Prefer live Stripe state when the hotel has a Stripe customer (prevents App restore from overwriting Web billing). */
export async function reconcileStripeSubscriptionIfPresent(
  hotelId: string,
): Promise<StripeSubscriptionSyncResult | null> {
  const billing = await getSubscriptionBillingState(hotelId);
  if (!billing.stripeCustomerId && billing.billingProvider !== "stripe") {
    return null;
  }
  return syncStripeSubscriptionForHotel(hotelId);
}

export async function upsertAppleSubscriptionFromTransaction(params: {
  hotelId: string;
  transaction: JWSTransactionDecodedPayload;
  environment: AppleStoreEnvironment;
  /** When set, overrides transaction.productId for plan mapping (renewal-aware sync). */
  effectiveProductId?: string | null;
}): Promise<{ plan: PlanType; status: SubscriptionStatus }> {
  const { hotelId, transaction, environment } = params;
  const productId = params.effectiveProductId ?? transaction.productId ?? null;
  const mappedPlan = mapAppleProductIdToPlan(productId);
  if (!mappedPlan) {
    throw new Error(`Unknown Apple product id: ${productId ?? "null"}`);
  }

  const mappedStatus = mapAppleTransactionStatus(transaction);
  const plan: PlanType = mappedStatus === "canceled" ? "free" : mappedPlan;
  const originalTransactionId =
    transaction.originalTransactionId ?? transaction.transactionId ?? null;

  await assertAppleTransactionForHotel(hotelId, originalTransactionId);

  await ensureHotelSubscriptionRpc(hotelId);

  const admin = getSupabaseAdminServerClient();

  try {
    await updateHotelSubscription(admin, hotelId, {
      plan,
      status: mappedStatus,
      max_published_pages: resolveMaxPublishedPagesByPlan(plan),
      billing_provider: mappedStatus === "canceled" ? null : "apple",
      apple_original_transaction_id: originalTransactionId,
      apple_product_id: productId,
      apple_environment: environment,
      current_period_end: transactionPeriodEndIso(transaction),
      cancel_at_period_end: false,
      cancel_at: null,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    if (isAppleOriginalTransactionIdConflict(error)) {
      throw new AppleTransactionLinkedToOtherHotelError();
    }
    throw error;
  }

  return { plan, status: mappedStatus };
}

export async function appendAppleBillingLog(params: {
  hotelId: string;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const admin = getSupabaseAdminServerClient();
  await admin.from("audit_logs").insert({
    hotel_id: params.hotelId,
    actor_user_id: null,
    action: params.action,
    target_type: "subscription",
    message: params.message,
    metadata: params.metadata ?? {},
  });
}
