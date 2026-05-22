import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import { getSupabaseClient } from "@/lib/supabase";

export async function signInWithApple(): Promise<{ error: string | null }> {
  if (Platform.OS !== "ios") {
    return { error: "Appleログインは iOS のみ利用できます" };
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    return { error: "この端末では Appleログインを利用できません" };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: "Supabase が未設定です" };
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { error: "Apple ID トークンを取得できませんでした" };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    });
    return { error: error?.message ?? null };
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "ERR_REQUEST_CANCELED") {
      return { error: "キャンセルされました" };
    }
    return { error: e instanceof Error ? e.message : "Appleログインに失敗しました" };
  }
}
