import { shouldUseAppleIapBilling } from "@/lib/app-store-compliance";
import { isNativeIapAvailable } from "@/lib/native-iap";

/** In-app shell Plan tab (StoreKit billing). */
export const APP_BILLING_PATH = "/settings/billing";

/** Opens Apple’s subscription management (works for production and sandbox purchases). */
export const APPLE_SUBSCRIPTIONS_URL = "https://apps.apple.com/account/subscriptions";

export function isAppStoreBillingContext(): boolean {
  return shouldUseAppleIapBilling() && isNativeIapAvailable();
}

export function navigateToAppBilling(): void {
  if (typeof window === "undefined") return;
  window.location.assign(APP_BILLING_PATH);
}

export function openAppleSubscriptionManagement(): void {
  if (typeof window === "undefined") return;
  window.location.assign(APPLE_SUBSCRIPTIONS_URL);
}
