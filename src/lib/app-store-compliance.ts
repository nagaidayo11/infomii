import { isNativeInfomiiAppClient } from "@/lib/client-shell";

/** Production web origin for external billing / legal links from the native shell. */
export const INFOMII_PUBLIC_ORIGIN =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL?.trim()) ||
  "https://www.infomii.com";

const IOS_UA_RE = /iPhone|iPad|iPod/i;

export function isNativeIosAppClient(userAgent?: string): boolean {
  const ua =
    userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  return isNativeInfomiiAppClient(ua) && IOS_UA_RE.test(ua);
}

/** iOS native shell uses App Store IAP for new subscriptions (Guideline 3.1.1). */
export function shouldUseAppleIapBilling(userAgent?: string): boolean {
  return isNativeIosAppClient(userAgent);
}

/** @deprecated App shell must not open the marketing LP for billing — use navigateToAppBilling. */
export function navigateToWebPricingLp(): void {
  if (typeof window === "undefined") return;
  if (shouldUseAppleIapBilling()) {
    window.location.assign("/settings/billing");
    return;
  }
  window.location.assign(WEB_PRICING_LP_PATH);
}

/** @deprecated Use shouldUseAppleIapBilling — kept for transitional imports. */
export function shouldBlockInAppSubscriptionCheckout(_userAgent?: string): boolean {
  return shouldUseAppleIapBilling(_userAgent);
}

/** Web marketing LP path (not used for in-app billing). */
export const WEB_PRICING_LP_PATH = "/lp/saas#pricing";

/** Public pricing LP — web only. */
export function getWebPricingLpUrl(): string {
  return `${INFOMII_PUBLIC_ORIGIN.replace(/\/$/, "")}${WEB_PRICING_LP_PATH}`;
}

export function getLegalPageUrl(path: "/terms" | "/privacy" | "/commerce", appShell: boolean): string {
  const base = `${INFOMII_PUBLIC_ORIGIN.replace(/\/$/, "")}${path}`;
  return appShell ? `${base}?client=app` : base;
}

export const SUPPORT_EMAIL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()) ||
  "support@infomii.com";
