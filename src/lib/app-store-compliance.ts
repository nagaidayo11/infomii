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

/**
 * App Store Guideline 3.1.1: avoid new digital subscription checkout inside the iOS app shell.
 * Existing subscribers may still open Stripe Customer Portal to manage/cancel.
 */
export function shouldBlockInAppSubscriptionCheckout(userAgent?: string): boolean {
  return isNativeIosAppClient(userAgent);
}

export function getWebBillingUrl(): string {
  return `${INFOMII_PUBLIC_ORIGIN.replace(/\/$/, "")}/settings/billing`;
}

export function getLegalPageUrl(path: "/terms" | "/privacy" | "/commerce", appShell: boolean): string {
  const base = `${INFOMII_PUBLIC_ORIGIN.replace(/\/$/, "")}${path}`;
  return appShell ? `${base}?client=app` : base;
}

export const SUPPORT_EMAIL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim()) ||
  "support@infomii.com";
