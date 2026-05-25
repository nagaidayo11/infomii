import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";
import { APP_PUBLIC_URL } from "@/lib/config";
import { getSupabaseClient } from "@/lib/supabase";

const OAUTH_CALLBACK_PATH = "auth/callback";
const WEB_MOBILE_CALLBACK_PATH = "/auth/mobile-callback";
/**
 * Supabase Redirect URLs に登録する OAuth 戻り先（この URL をそのまま追加）。
 * /login?mobile=1 は Web がセッションを消費しアプリに code が渡らないため使わない。
 */
export function getAuthRedirectUri(): string {
  return `${APP_PUBLIC_URL}${WEB_MOBILE_CALLBACK_PATH}`;
}

export function getAuthRedirectUriAlternates(): string[] {
  return [`${APP_PUBLIC_URL}${WEB_MOBILE_CALLBACK_PATH}`];
}

/** 外部ブラウザ用フォールバック（infomii:// / exp://） */
export function getNativeOAuthReturnUri(): string {
  const isExpoGo = Constants.appOwnership === "expo";
  if (isExpoGo) {
    return makeRedirectUri({ path: OAUTH_CALLBACK_PATH });
  }
  return makeRedirectUri({
    scheme: "infomii",
    path: OAUTH_CALLBACK_PATH,
    preferLocalhost: false,
  });
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

/** Supabase OAuth リダイレクト URL からセッションを復元（PKCE code / hash トークン両対応） */
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
