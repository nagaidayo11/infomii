import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthenticatedWebView } from "@/components/AuthenticatedWebView";
import { APP_PUBLIC_URL, publicPageUrl } from "@/lib/config";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";

/** 公開ページ `/p/[slug]` と同じプレビュー（Web と完全一致） */
export default function PublicPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug, draft } = useLocalSearchParams<{ slug?: string; draft?: string }>();

  const pageSlug = typeof slug === "string" ? slug : "";
  const isDraft = draft === "1";
  const uri = pageSlug
    ? isDraft
      ? `${APP_PUBLIC_URL}/v/${pageSlug}?preview=1`
      : publicPageUrl(pageSlug)
    : publicPageUrl("");

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>公開プレビュー</Text>
        <View style={styles.spacer} />
      </View>
      {pageSlug ? (
        <AuthenticatedWebView uri={uri} style={styles.web} />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>slug がありません</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.warmWhite },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.frost,
  },
  title: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "600", color: colors.ink },
  spacer: { width: 24 },
  web: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.inkMuted },
});
