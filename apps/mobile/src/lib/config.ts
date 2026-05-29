/**
 * Web app origin loaded inside the native shell.
 * Production: https://www.infomii.com
 * Local dev: http://127.0.0.1:3000 (run Next.js with npm run dev)
 */
const DEFAULT_WEB_ORIGIN = "https://www.infomii.com";

export function getWebOrigin(): string {
  const raw = process.env.EXPO_PUBLIC_WEB_ORIGIN?.trim() || DEFAULT_WEB_ORIGIN;
  return raw.replace(/\/$/, "");
}

export function getAppEntryUrl(): string {
  const origin = getWebOrigin();
  return `${origin}/dashboard?client=app`;
}

/** Appended to the WebView user agent for Phase 1 client detection on the web app. */
export const WEBVIEW_USER_AGENT_SUFFIX = "InfomiiApp/1.0";
