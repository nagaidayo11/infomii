/** Canonical production site origin (prefer www). */
export const AUTH_SITE_ORIGIN =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL?.trim()) ||
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL?.trim()) ||
  "https://www.infomii.com";

/** Use the current browser origin so www / non-www match Supabase allow-list entries. */
export function getAuthRedirectOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }
  return AUTH_SITE_ORIGIN.replace(/\/$/, "");
}

export type AuthCallbackOptions = {
  /** Relative path after auth succeeds (must start with `/`). */
  next?: string;
  /** Supabase auth flow hint (signup confirmation, password recovery, etc.). */
  type?: "signup" | "recovery";
  /** Preserve native app shell query for WebView. */
  client?: "app";
};

/** Supabase `redirectTo` / `emailRedirectTo` target for OAuth, email confirm, and recovery. */
export function buildAuthCallbackUrl(options?: AuthCallbackOptions): string {
  const origin = getAuthRedirectOrigin();
  const params = new URLSearchParams();
  if (options?.next && options.next.startsWith("/")) {
    params.set("next", options.next);
  }
  if (options?.type) {
    params.set("type", options.type);
  }
  if (options?.client === "app") {
    params.set("client", "app");
  }
  const qs = params.toString();
  return `${origin}/auth/callback${qs ? `?${qs}` : ""}`;
}

export function buildAuthConfirmedUrl(client?: "app"): string {
  const origin = getAuthRedirectOrigin();
  if (client === "app") {
    return `${origin}/auth/confirmed?client=app`;
  }
  return `${origin}/auth/confirmed`;
}

export function buildLoginConfirmedUrl(client?: "app"): string {
  const origin = getAuthRedirectOrigin();
  const params = new URLSearchParams({ confirmed: "1" });
  if (client === "app") {
    params.set("client", "app");
  }
  return `${origin}/login?${params.toString()}`;
}
