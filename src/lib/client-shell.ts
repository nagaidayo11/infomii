/** Cookie set when running inside the native app WebView (or ?client=app). */
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
  cookie?: string | null;
}): ClientShell {
  if (typeof window !== "undefined" && window.__INFOMII_CLIENT__ === "app") {
    return "app";
  }
  const fromQuery = options.search != null ? readClientShellFromSearch(options.search) : null;
  if (fromQuery === "app") return "app";
  if (fromQuery === "web") return "web";
  if (options.cookie === CLIENT_SHELL_APP_VALUE) return "app";
  if (options.userAgent && isInfomiiAppUserAgent(options.userAgent)) return "app";
  return "web";
}

export function persistClientShellCookie(client: ClientShell): void {
  if (typeof document === "undefined") return;
  if (client === "app") {
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
