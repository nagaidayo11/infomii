import * as WebBrowser from "expo-web-browser";
import { applyOAuthRedirectUrl, getAuthRedirectUri } from "@/lib/oauth-session";
import { getSupabaseClient } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export {
  getAuthRedirectUri,
  getAuthRedirectUriAlternates,
  getNativeOAuthReturnUri,
} from "@/lib/oauth-session";

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

  try {
    const authUrl = new URL(data.url);
    const redirectParam = authUrl.searchParams.get("redirect_to") ?? "";
    if (
      !redirectParam.includes("mobile=1") &&
      !redirectParam.includes("mobile-callback")
    ) {
      return {
        error:
          "OAuth の戻り先が正しく設定されていません。Supabase の Redirect URLs に " +
          redirectTo +
          " を追加してください。",
      };
    }
  } catch {
    /* ignore parse errors */
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
    preferEphemeralSession: true,
  });

  if (result.type === "success" && result.url) {
    return applyOAuthRedirectUrl(result.url);
  }

  if (result.type === "cancel") {
    return { error: "キャンセルされました" };
  }

  return {
    error:
      "認証後にアプリへ戻れませんでした。Supabase の Redirect URLs に次を追加してください: " +
      redirectTo,
  };
}
