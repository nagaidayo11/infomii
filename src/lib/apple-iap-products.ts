/**
 * App Store subscription product IDs (must match App Store Connect).
 * Stripe prices remain separate for web checkout.
 */
export const APPLE_IAP_BUNDLE_ID = "com.infomii.app";

export const APPLE_IAP_PRODUCT_IDS = {
  pro_monthly: "com.infomii.app.pro.monthly",
  pro_annual: "com.infomii.app.pro.annual",
  business_monthly: "com.infomii.app.business.monthly",
  business_annual: "com.infomii.app.business.annual",
} as const;

export type AppleIapProductId = (typeof APPLE_IAP_PRODUCT_IDS)[keyof typeof APPLE_IAP_PRODUCT_IDS];

export const ALL_APPLE_IAP_PRODUCT_IDS: AppleIapProductId[] = Object.values(APPLE_IAP_PRODUCT_IDS);

export type AppleIapPlan = "pro" | "business";
export type AppleIapInterval = "monthly" | "yearly";

export function getAppleProductId(plan: AppleIapPlan, interval: AppleIapInterval): AppleIapProductId {
  if (plan === "pro") {
    return interval === "yearly" ? APPLE_IAP_PRODUCT_IDS.pro_annual : APPLE_IAP_PRODUCT_IDS.pro_monthly;
  }
  return interval === "yearly" ? APPLE_IAP_PRODUCT_IDS.business_annual : APPLE_IAP_PRODUCT_IDS.business_monthly;
}

export function mapAppleProductIdToPlan(productId: string | null | undefined): AppleIapPlan | null {
  if (!productId) return null;
  if (
    productId === APPLE_IAP_PRODUCT_IDS.business_monthly ||
    productId === APPLE_IAP_PRODUCT_IDS.business_annual
  ) {
    return "business";
  }
  if (productId === APPLE_IAP_PRODUCT_IDS.pro_monthly || productId === APPLE_IAP_PRODUCT_IDS.pro_annual) {
    return "pro";
  }
  return null;
}

export function isAppleIapProductId(productId: string): productId is AppleIapProductId {
  return (ALL_APPLE_IAP_PRODUCT_IDS as string[]).includes(productId);
}
