import { shouldUseAppleIapBilling } from "@/lib/app-store-compliance";
import { isNativeIapAvailable } from "@/lib/native-iap";

/** In-app shell Plan tab (StoreKit billing). */
export const APP_BILLING_PATH = "/settings/billing";

export function isAppStoreBillingContext(): boolean {
  return shouldUseAppleIapBilling() && isNativeIapAvailable();
}

export function navigateToAppBilling(): void {
  if (typeof window === "undefined") return;
  window.location.assign(APP_BILLING_PATH);
}
