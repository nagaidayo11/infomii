/**
 * Native app WebView detection. Do not use a long-lived cookie alone — that would
 * enable the app tab bar in normal desktop/mobile browsers after ?client=app testing.
 */
export const CLIENT_SHELL_COOKIE = "infomii_client";
export const CLIENT_SHELL_APP_VALUE = "app";

export type ClientShell = "web" | "app";

declare global {
  interface Window {
    __INFOMII_CLIENT__?: ClientShell;
  }
}

const INFOMII_APP_UA_RE = /InfomiiApp/i;

export function isInfomiiAppUserAgent(userAgent: string): boolean {
  return INFOMII_APP_UA_RE.test(userAgent);
}

export function readClientShellFromSearch(search: string): ClientShell | null {
  const value = new URLSearchParams(search).get("client");
  if (value === "app") return "app";
  if (value === "web") return "web";
  return null;
}

export function detectClientShell(options: {
  search?: string;
  userAgent?: string;
}): ClientShell {
  if (typeof window !== "undefined" && window.__INFOMII_CLIENT__ === "app") {
    return "app";
  }
  const fromQuery = options.search != null ? readClientShellFromSearch(options.search) : null;
  if (fromQuery === "app") return "app";
  if (fromQuery === "web") return "web";
  if (options.userAgent && isInfomiiAppUserAgent(options.userAgent)) return "app";
  return "web";
}

/** Persist only for native WebView (UA / injection). Clears cookie for normal web. */
export function persistClientShellCookie(client: ClientShell, options?: { nativeApp?: boolean }): void {
  if (typeof document === "undefined") return;
  const shouldPersistApp = client === "app" && options?.nativeApp === true;
  if (shouldPersistApp) {
    const maxAge = 60 * 60 * 24 * 400;
    document.cookie = `${CLIENT_SHELL_COOKIE}=${CLIENT_SHELL_APP_VALUE}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } else {
    document.cookie = `${CLIENT_SHELL_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function readClientShellCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CLIENT_SHELL_COOKIE}=([^;]*)`));
  return match?.[1] ?? null;
}

export function isNativeInfomiiAppClient(userAgent?: string): boolean {
  if (typeof window !== "undefined" && window.__INFOMII_CLIENT__ === "app") return true;
  if (userAgent && isInfomiiAppUserAgent(userAgent)) return true;
  return false;
}
