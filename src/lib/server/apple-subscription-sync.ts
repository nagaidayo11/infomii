import { mapAppleProductIdToPlan } from "@/lib/apple-iap-products";
import { resolveMaxPublishedPagesByPlan } from "@/lib/plan-limits";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";
import { updateHotelSubscription } from "@/lib/server/subscription-update";
import {
  mapAppleTransactionStatus,
  transactionPeriodEndIso,
  type AppleStoreEnvironment,
} from "@/lib/server/apple-store-server";
import type { JWSTransactionDecodedPayload } from "@apple/app-store-server-library";

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

  const admin = getSupabaseAdminServerClient();
  await admin.rpc("ensure_hotel_subscription", { target_hotel_id: hotelId });

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
