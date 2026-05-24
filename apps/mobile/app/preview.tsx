import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TimelineView } from "@/components/TimelineView";
import { draftToPreviewBlocks } from "@/lib/draft-preview";
import { colors } from "@/design/colors";
import { spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import type { DraftBlock } from "@/types/itinerary";

export default function CreatePreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ title?: string; blocks?: string }>();

  const title = typeof params.title === "string" ? params.title : "プレビュー";
  let blocks: DraftBlock[] = [];
  try {
    if (typeof params.blocks === "string") {
      blocks = JSON.parse(params.blocks) as DraftBlock[];
    }
  } catch {
    blocks = [];
  }

  const timeline = draftToPreviewBlocks(title, blocks);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.barTitle}>プレビュー</Text>
        <View style={styles.barSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{blocks.length} ブロック · 編集中の内容</Text>
        <TimelineView blocks={timeline} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.warmWhite },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
  },
  barTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "600", color: colors.ink },
  barSpacer: { width: 24 },
  content: { padding: spacing.screen, paddingBottom: spacing.xxxl, gap: spacing.md },
  title: { fontSize: 26, fontWeight: "700", color: colors.ink },
  meta: typography.caption,
});
