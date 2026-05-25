import { useURL } from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { applyOAuthRedirectUrl } from "@/lib/oauth-session";
import { completeAfterLogin } from "@/lib/post-auth";

/** Google OAuth 復帰（infomii:// または exp:// のディープリンク） */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const url = useURL();
  const handled = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url || handled.current) return;
    handled.current = true;

    void (async () => {
      const { error: oauthError } = await applyOAuthRedirectUrl(url);
      if (oauthError) {
        setError(oauthError);
        return;
      }
      await completeAfterLogin(router);
    })();
  }, [url, router]);

  return (
    <View style={styles.center}>
      {error ? (
        <>
          <Text style={styles.errorTitle}>ログインを完了できませんでした</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Text style={styles.link} onPress={() => router.replace("/auth")}>
            ログイン画面に戻る
          </Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.accentDeep} />
          <Text style={styles.body}>ログインを完了しています…</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.screen,
    backgroundColor: colors.warmWhite,
    gap: spacing.md,
  },
  body: { fontSize: 14, color: colors.inkMuted },
  errorTitle: { fontSize: 16, fontWeight: "700", color: colors.ink, textAlign: "center" },
  errorBody: { fontSize: 14, color: colors.danger, textAlign: "center", lineHeight: 22 },
  link: { fontSize: 15, fontWeight: "600", color: colors.accentDeep, marginTop: spacing.md },
});
