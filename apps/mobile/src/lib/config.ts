import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Web app origin loaded inside the native shell.
 * Production: https://www.infomii.com
 * Local dev (simulator): http://127.0.0.1:3000
 * Local dev (physical device): http://<your-mac-lan-ip>:3000
 */
const DEFAULT_WEB_ORIGIN = "https://www.infomii.com";

const INVALID_ORIGIN_HINT_RE = /<|YOUR_MAC|MacのIP|example\.com/i;
const LOCALHOST_ORIGIN_RE = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/i;

export type WebOriginResolution =
  | { ok: true; origin: string }
  | { ok: false; origin: string; message: string };

function getMetroLanHost(): string | null {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;
  if (!debuggerHost) return null;
  const host = debuggerHost.split(":")[0]?.trim();
  if (!host || host === "localhost" || host === "127.0.0.1") return null;
  return host;
}

function normalizeOrigin(raw: string): string {
  return raw.trim().replace(/\/$/, "");
}

function replaceLocalhostWithLanHost(origin: string): WebOriginResolution | null {
  if (!LOCALHOST_ORIGIN_RE.test(origin) || Platform.OS === "web") return null;

  const lanHost = getMetroLanHost();
  if (!lanHost) {
    return {
      ok: false,
      origin,
      message:
        "実機では 127.0.0.1 / localhost は使えません。.env に Mac の LAN IP を設定してください（例: http://192.168.1.10:3000）。確認: ipconfig getifaddr en0",
    };
  }

  const port = new URL(origin).port || "3000";
  const resolved = `http://${lanHost}:${port}`;
  return { ok: true, origin: resolved };
}

export function resolveWebOrigin(): WebOriginResolution {
  const raw = process.env.EXPO_PUBLIC_WEB_ORIGIN?.trim() || DEFAULT_WEB_ORIGIN;

  if (INVALID_ORIGIN_HINT_RE.test(raw)) {
    return {
      ok: false,
      origin: raw,
      message:
        ".env の EXPO_PUBLIC_WEB_ORIGIN がプレースホルダのままです。実際の IP に置き換えてください（例: http://192.168.1.10:3000）。",
    };
  }

  let origin = normalizeOrigin(raw);

  try {
    new URL(origin);
  } catch {
    return {
      ok: false,
      origin,
      message: "EXPO_PUBLIC_WEB_ORIGIN が不正な URL です。",
    };
  }

  const localhostResolved = replaceLocalhostWithLanHost(origin);
  if (localhostResolved) return localhostResolved;

  // Expo Go 開発中に .env が本番のままだと UI 修正が一切反映されないため、Metro の LAN IP へ切替
  const isProductionOrigin =
    origin === DEFAULT_WEB_ORIGIN ||
    origin === "https://infomii.com" ||
    origin.endsWith(".infomii.com");
  if (__DEV__ && isProductionOrigin) {
    const lanHost = getMetroLanHost();
    if (lanHost) {
      const resolved = `http://${lanHost}:3000`;
      return { ok: true, origin: resolved };
    }
  }

  return { ok: true, origin };
}

export function getWebOrigin(): string {
  return resolveWebOrigin().origin;
}

export function getAppEntryUrl(): string {
  const origin = getWebOrigin();
  return `${origin}/onboarding?client=app`;
}

/** Appended to the WebView user agent for Phase 1 client detection on the web app. */
export const WEBVIEW_USER_AGENT_SUFFIX = "InfomiiApp/1.0";
