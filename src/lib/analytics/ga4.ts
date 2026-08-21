/**
 * Client-side GA4 helpers. No-ops when gtag is unavailable (dev / blocked).
 */

export type Ga4EventParams = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackGa4Event(eventName: string, params?: Ga4EventParams): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  const cleaned: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      cleaned[key] = value;
    }
  }
  window.gtag("event", eventName, cleaned);
}

/** Mark a brand-new account (email register or OAuth first session). */
export function trackSignupComplete(method: "email" | "google" | "apple"): void {
  trackGa4Event("signup_complete", { method });
}

export function trackLoginSuccess(method: "email" | "google" | "apple" | "invite"): void {
  trackGa4Event("login", { method });
}

/** True when auth user was created very recently (OAuth first-time). */
export function isLikelyNewAuthUser(createdAtIso: string | null | undefined, windowMs = 15 * 60 * 1000): boolean {
  if (!createdAtIso) return false;
  const created = Date.parse(createdAtIso);
  if (!Number.isFinite(created)) return false;
  return Date.now() - created < windowMs;
}
