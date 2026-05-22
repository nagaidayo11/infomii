import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { getSupabaseClient } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export function getAuthRedirectUri(): string {
  return makeRedirectUri({ scheme: "infomii", path: "auth/callback" });
}

export async function signInWithGoogleOAuth(): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Supabase が未設定です" };
  }

  const redirectTo = getAuthRedirectUri();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) return { error: error.message };
  if (!data?.url) return { error: "OAuth URL を取得できませんでした" };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success" || !result.url) {
    return { error: result.type === "cancel" ? "キャンセルされました" : "認証に失敗しました" };
  }

  const { params, errorCode } = QueryParams.getQueryParams(result.url);
  if (errorCode) return { error: errorCode };

  const access_token = params.access_token;
  const refresh_token = params.refresh_token;
  if (!access_token || !refresh_token) {
    return { error: "セッションを取得できませんでした" };
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  return { error: sessionError?.message ?? null };
}
