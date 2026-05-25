import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { writePendingInviteCode } from "@/lib/invite-pending";
import { completeAfterLogin } from "@/lib/post-auth";
import { useAuth } from "@/stores/auth-provider";

export default function InviteDeepLinkScreen() {
  const router = useRouter();
  const { code: rawCode } = useLocalSearchParams<{ code: string }>();
  const { user, loading } = useAuth();
  const code = useMemo(() => (rawCode ?? "").trim().toUpperCase(), [rawCode]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError("招待コードが不正です。");
      return;
    }
    void writePendingInviteCode(code);
  }, [code]);

  useEffect(() => {
    if (!code || loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    void (async () => {
      try {
        await completeAfterLogin(router);
      } catch (e) {
        setError(e instanceof Error ? e.message : "招待コードの適用に失敗しました");
      }
    })();
  }, [code, user, loading, router]);

  return (
    <Screen>
      <View style={styles.box}>
        <Text style={styles.title}>チーム招待</Text>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <ActivityIndicator color={colors.accentDeep} />
            <Text style={styles.body}>招待コードを確認しています…</Text>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing.screen,
  },
  title: { ...typography.hero, fontSize: 20 },
  body: { ...typography.body, textAlign: "center" },
  error: { color: colors.danger, textAlign: "center", lineHeight: 22 },
});
