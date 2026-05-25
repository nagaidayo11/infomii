import { makeRedirectUri } from "expo-auth-session";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { APP_PUBLIC_URL } from "@/lib/config";
import { getSupabaseClient } from "@/lib/supabase";

const OAUTH_CALLBACK_PATH = "auth/callback";
const WEB_MOBILE_CALLBACK_PATH = "/auth/mobile-callback";

export function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

/** アプリが受け取る deep link（exp:// または infomii://） */
export function getNativeOAuthReturnUri(): string {
  const fromLinking = Linking.createURL(OAUTH_CALLBACK_PATH);
  if (fromLinking.startsWith("exp://") || fromLinking.startsWith("infomii://")) {
    return fromLinking;
  }
  if (isExpoGo()) {
    return makeRedirectUri({ path: OAUTH_CALLBACK_PATH });
  }
  return makeRedirectUri({
    scheme: "infomii",
    path: OAUTH_CALLBACK_PATH,
    preferLocalhost: false,
  });
}

/**
 * Supabase Redirect URLs に登録する URI（ログイン画面に表示）。
 * - Expo Go: 表示された exp://… をそのまま追加
 * - 開発ビルド/本番: https://…/auth/mobile-callback*（ワイルドカード）
 */
export function getAuthRedirectUri(): string {
  if (isExpoGo()) {
    return getNativeOAuthReturnUri();
  }
  const native = encodeURIComponent(getNativeOAuthReturnUri());
  return `${APP_PUBLIC_URL}${WEB_MOBILE_CALLBACK_PATH}?native=${native}`;
}

/** WebBrowser.openAuthSessionAsync の第2引数（この URL に着いたらアプリへ返す） */
export function getOAuthBrowserReturnUrl(): string {
  if (isExpoGo()) {
    return getNativeOAuthReturnUri();
  }
  return `${APP_PUBLIC_URL}${WEB_MOBILE_CALLBACK_PATH}`;
}

export function getAuthRedirectUriAlternates(): string[] {
  const native = getNativeOAuthReturnUri();
  if (isExpoGo()) {
    return [native, `${APP_PUBLIC_URL}${WEB_MOBILE_CALLBACK_PATH}*`];
  }
  return [
    `${APP_PUBLIC_URL}${WEB_MOBILE_CALLBACK_PATH}*`,
    `${APP_PUBLIC_URL}${WEB_MOBILE_CALLBACK_PATH}`,
    native,
  ];
}

export function isNativeOAuthRedirectUri(uri: string): boolean {
  return uri.startsWith("exp://") || uri.startsWith("infomii://");
}

function readRedirectParams(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  const afterQuery = url.includes("?") ? (url.split("?")[1] ?? "") : "";
  const queryOnly = afterQuery.split("#")[0] ?? "";
  const hashOnly = url.includes("#") ? url.slice(url.indexOf("#") + 1) : "";

  for (const part of [queryOnly, hashOnly]) {
    if (!part) continue;
    const sp = new URLSearchParams(part);
    sp.forEach((value, key) => {
      out[key] = value;
    });
  }
  return out;
}

export async function applyOAuthRedirectUrl(url: string): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Supabase が未設定です" };
  }

  const params = readRedirectParams(url);
  const oauthError = params.error_description ?? params.error;
  if (oauthError) {
    return { error: oauthError };
  }

  const code = params.code;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return { error: error?.message ?? null };
  }

  const access_token = params.access_token;
  const refresh_token = params.refresh_token;
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    return { error: error?.message ?? null };
  }

  return { error: "セッションを取得できませんでした" };
}
