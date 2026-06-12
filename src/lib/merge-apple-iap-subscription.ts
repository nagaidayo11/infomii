import type { VerifyAppleIapResult } from "@/lib/apple-iap-client";
import { inferSubscriptionBillingInterval } from "@/lib/billing-interval";
import { resolveMaxPublishedPagesByPlan } from "@/lib/plan-limits";
import type { HotelSubscription } from "@/lib/storage";

export function mergeAppleIapResultIntoSubscription(
  current: HotelSubscription | null | undefined,
  result: VerifyAppleIapResult,
): HotelSubscription {
  const plan = result.plan;
  const base: HotelSubscription = current ?? {
    id: "pending",
    plan: "free",
    status: "active",
    maxPublishedPages: resolveMaxPublishedPagesByPlan("free"),
    cancelAtPeriodEnd: false,
    cancelAt: null,
    currentPeriodEnd: null,
    hasStripeCustomer: false,
    billingProvider: null,
    hasAppleSubscription: false,
    billingInterval: null,
    updatedAt: new Date().toISOString(),
  };

  const activeLike = result.status === "active" || result.status === "trialing";

  return {
    ...base,
    plan,
    status: activeLike ? result.status : base.status,
    maxPublishedPages: Math.max(base.maxPublishedPages, resolveMaxPublishedPagesByPlan(plan)),
    currentPeriodEnd: result.currentPeriodEnd ?? base.currentPeriodEnd,
    billingProvider: activeLike && plan !== "free" ? "apple" : base.billingProvider,
    hasAppleSubscription: true,
    billingInterval:
      inferSubscriptionBillingInterval({
        appleProductId: result.productId,
        stripePriceId: null,
      }) ?? base.billingInterval,
    updatedAt: new Date().toISOString(),
  };
}
