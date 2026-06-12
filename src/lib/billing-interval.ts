import { mapAppleProductIdToInterval, type AppleIapInterval } from "@/lib/apple-iap-products";

export type BillingInterval = AppleIapInterval;

export function inferSubscriptionBillingInterval(params: {
  appleProductId?: string | null;
  stripePriceId?: string | null;
}): BillingInterval | null {
  const fromApple = mapAppleProductIdToInterval(params.appleProductId);
  if (fromApple) return fromApple;

  const stripePriceId = params.stripePriceId?.trim();
  if (!stripePriceId) return null;

  const annualIds = [
    process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_ANNUAL_PRICE_ID,
  ].filter((value): value is string => Boolean(value));
  if (annualIds.includes(stripePriceId)) return "yearly";

  const monthlyIds = [
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
  ].filter((value): value is string => Boolean(value));
  if (monthlyIds.includes(stripePriceId)) return "monthly";

  // Stripe Price ID suffix heuristic when public env IDs are not configured in the shell.
  if (/annual|year/i.test(stripePriceId)) return "yearly";
  if (/month/i.test(stripePriceId)) return "monthly";

  return null;
}

export function billingIntervalLabel(interval: BillingInterval | null | undefined): string {
  if (interval === "yearly") return "年払い";
  if (interval === "monthly") return "月払い";
  return "";
}
