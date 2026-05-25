import { getSupabaseClient } from "@/lib/supabase";

/** Web エディタ WebView 用: Supabase JS が使う localStorage キー */
export function getSupabaseAuthStorageKey(): string | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    const ref = host.split(".")[0];
    return `sb-${ref}-auth-token`;
  } catch {
    return null;
  }
}

/** WebView 読み込み前にセッションを localStorage へ注入するスクリプト */
export function buildSupabaseSessionInjectionScript(): string | null {
  const key = getSupabaseAuthStorageKey();
  if (!key) return null;

  return `(async function() {
    try {
      const payload = window.__INFOMII_MOBILE_SESSION__;
      if (!payload) return;
      localStorage.setItem(${JSON.stringify(key)}, payload);
    } catch (e) {}
  })(); true;`;
}

export async function getSessionPayloadForWebView(): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return JSON.stringify({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in,
    token_type: data.session.token_type,
    user: data.session.user,
  });
}
