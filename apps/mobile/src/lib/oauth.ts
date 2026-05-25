import * as WebBrowser from "expo-web-browser";
import {
  applyOAuthRedirectUrl,
  getAuthRedirectUri,
  getOAuthBrowserReturnUrl,
  isExpoGo,
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
  if (isNativeOAuthRedirectUri(url)) return false;
  if (!url.includes("infomii.com")) return false;
  if (url.includes("/auth/mobile-callback")) return false;
  if (url.includes("code=")) return false;
  return url.includes("/dashboard") || /infomii\.com\/?$/.test(url.replace(/^https?:\/\//, ""));
}

function parseRedirectToFromAuthUrl(authUrl: string): string {
  try {
    const u = new URL(authUrl);
    const raw = u.searchParams.get("redirect_to") ?? "";
    return decodeURIComponent(raw);
  } catch {
    return "";
  }
}

export async function signInWithGoogleOAuth(): Promise<{ error: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Supabase が未設定です" };
  }

  const redirectTo = getAuthRedirectUri();
  const browserReturnUrl = getOAuthBrowserReturnUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) return { error: error.message };
  if (!data?.url) return { error: "OAuth URL を取得できませんでした" };

  const redirectParam = parseRedirectToFromAuthUrl(data.url);
  const redirectOk =
    redirectParam.includes("/auth/mobile-callback") ||
    isNativeOAuthRedirectUri(redirectParam);
  if (!redirectOk) {
    return {
      error:
        "OAuth の戻り先が Supabase に登録されていません。\n\n" +
        "Redirect URLs に次を追加してください:\n" +
        (isExpoGo()
          ? browserReturnUrl
          : `${browserReturnUrl}*`) +
        "\n\n（実際の redirect_to: " +
        (redirectParam || "未設定") +
        "）",
    };
  }

  await WebBrowser.warmUpAsync();
  const result = await WebBrowser.openAuthSessionAsync(data.url, browserReturnUrl, {
    showInRecents: true,
    preferEphemeralSession: true,
  });
  await WebBrowser.coolDownAsync();

  if (result.type === "success" && result.url) {
    if (isMisdirectedWebUrl(result.url)) {
      return {
        error:
          "認証後に Web ダッシュボードへ飛ばされました。\n\n" +
          "Supabase → Redirect URLs に次を追加:\n" +
          (isExpoGo() ? browserReturnUrl : `${browserReturnUrl}*`),
      };
    }
    return applyOAuthRedirectUrl(result.url);
  }

  if (result.type === "cancel") {
    return { error: "キャンセルされました" };
  }

  return {
    error:
      "認証後にアプリへ戻れませんでした（ブラウザ: " +
      result.type +
      "）。\n\n" +
      "Supabase → Redirect URLs:\n" +
      (isExpoGo() ? browserReturnUrl : `${browserReturnUrl}*`),
  };
}
