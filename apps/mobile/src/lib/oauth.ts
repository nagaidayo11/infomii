import * as WebBrowser from "expo-web-browser";
import {
  applyOAuthRedirectUrl,
  getAuthRedirectUri,
  getOAuthBrowserReturnPrefix,
  isNativeOAuthRedirectUri,
} from "@/lib/oauth-session";
import { getSupabaseClient } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export {
  getAuthRedirectUri,
  getAuthRedirectUriAlternates,
  getNativeOAuthReturnUri,
  isExpoGo,
} from "@/lib/oauth-session";

function isMisdirectedWebUrl(url: string): boolean {
  if (!url.includes("infomii.com")) return false;
  if (url.includes("/auth/mobile-callback")) return false;
  if (url.includes("code=")) return false;
  return url.includes("/dashboard") || url.endsWith("infomii.com") || url.endsWith("infomii.com/");
}

export async function signInWithGoogleOAuth(): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Supabase が未設定です" };
  }

  const redirectTo = getAuthRedirectUri();
  const browserReturnPrefix = getOAuthBrowserReturnPrefix();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) return { error: error.message };
  if (!data?.url) return { error: "OAuth URL を取得できませんでした" };

  try {
    const authUrl = new URL(data.url);
    const redirectParam = decodeURIComponent(authUrl.searchParams.get("redirect_to") ?? "");
    const redirectOk =
      redirectParam.includes("/auth/mobile-callback") ||
      isNativeOAuthRedirectUri(redirectParam);
    if (!redirectOk) {
      return {
        error:
          "OAuth の戻り先が正しくありません。Supabase Redirect URLs に次を追加してください:\n" +
          `${browserReturnPrefix}*`,
      };
    }
  } catch {
    /* ignore parse errors */
  }

  await WebBrowser.warmUpAsync();
  const result = await WebBrowser.openAuthSessionAsync(data.url, browserReturnPrefix, {
    showInRecents: true,
    preferEphemeralSession: true,
  });
  await WebBrowser.coolDownAsync();

  if (result.type === "success" && result.url) {
    if (isMisdirectedWebUrl(result.url)) {
      return {
        error:
          "認証後に Web ダッシュボードへ飛ばされました。Supabase → Redirect URLs に次を追加してから再試行してください:\n" +
          `${browserReturnPrefix}*`,
      };
    }
    return applyOAuthRedirectUrl(result.url);
  }

  if (result.type === "cancel") {
    return { error: "キャンセルされました" };
  }

  return {
    error:
      "認証後にアプリへ戻れませんでした。Supabase → Redirect URLs に次を追加してください:\n" +
      `${browserReturnPrefix}*`,
  };
}
