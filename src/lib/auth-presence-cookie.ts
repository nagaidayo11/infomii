import {
  AUTH_PRESENCE_COOKIE,
  AUTH_PRESENCE_VALUE,
} from "@/lib/auth-presence-constants";

export { AUTH_PRESENCE_COOKIE, AUTH_PRESENCE_VALUE };

const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export function setAuthPresenceCookie(): void {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_PRESENCE_COOKIE}=${AUTH_PRESENCE_VALUE}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function clearAuthPresenceCookie(): void {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_PRESENCE_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
}
