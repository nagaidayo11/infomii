import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { PostAuthRunner } from "@/components/PostAuthRunner";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { useAuth } from "@/stores/auth-provider";

function AuthLoading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.accentDeep} />
      <Text style={styles.loadingText}>読み込み中…</Text>
    </View>
  );
}

function SupabaseMissing() {
  return (
    <View style={styles.center}>
      <Text style={styles.missingTitle}>Supabase の設定が必要です</Text>
      <Text style={styles.missingBody}>
        `EXPO_PUBLIC_SUPABASE_URL` と `EXPO_PUBLIC_SUPABASE_ANON_KEY` を .env に設定してください。
      </Text>
    </View>
  );
}

export function RootAuthGuard() {
  const { user, loading, enabled } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const root = segments[0];
  const onAuth = root === "auth";
  const onOAuthCallback = onAuth && segments[1] === "callback";
  const onInvite = root === "invite";

  useEffect(() => {
    if (!enabled || loading) return;
    if (!user && !onAuth && !onInvite) {
      router.replace("/auth");
      return;
    }
    if (user && onAuth && !onOAuthCallback) {
      router.replace("/(tabs)");
    }
  }, [enabled, loading, user, onAuth, onOAuthCallback, onInvite, router]);

  if (!enabled) {
    return <SupabaseMissing />;
  }

  if (loading) {
    return <AuthLoading />;
  }

  if (!user && !onAuth && !onInvite) {
    return <AuthLoading />;
  }

  return (
    <>
      <PostAuthRunner />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="auth"
          options={{
            animation: "slide_from_bottom",
            presentation: Platform.OS === "ios" ? "fullScreenModal" : "card",
            gestureEnabled: false,
          }}
        />
        {/* auth/callback — OAuth ディープリンク（Google 復帰） */}
        <Stack.Screen name="invite/[code]" options={{ animation: "fade" }} />
        <Stack.Screen
          name="itinerary/[id]"
          options={{ animation: "slide_from_right", presentation: "card" }}
        />
        <Stack.Screen
          name="preview"
          options={{ animation: "slide_from_right", presentation: "card" }}
        />
        <Stack.Screen
          name="preview-public"
          options={{ animation: "slide_from_right", presentation: "card" }}
        />
        <Stack.Screen
          name="editor/[pageId]"
          options={{ animation: "slide_from_right", presentation: "card" }}
        />
      </Stack>
    </>
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
  loadingText: { fontSize: 14, color: colors.inkMuted },
  missingTitle: { fontSize: 18, fontWeight: "700", color: colors.ink, textAlign: "center" },
  missingBody: { fontSize: 14, lineHeight: 22, color: colors.inkMuted, textAlign: "center" },
});
