import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ShareSheet } from "@/components/ShareSheet";
import { TimelineView } from "@/components/TimelineView";
import { getCategoryLabel } from "@/data/sample-itineraries";
import { useItineraryDetail } from "@/hooks/use-itinerary-feed";
import { useShareSheet } from "@/hooks/use-share-sheet";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { selection, tapLight } from "@/lib/haptics";
import { useSaved } from "@/stores/saved-store";

export default function ItineraryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSaved, toggleSave } = useSaved();
  const { item, loading } = useItineraryDetail(typeof id === "string" ? id : undefined);
  const { shareItem, shareVisible, openShare, closeShare } = useShareSheet();

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={colors.accentDeep} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={typography.title}>Itinerary not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const saved = isSaved(item.id);

  return (
    <View style={styles.root}>
      <Image source={{ uri: item.coverImage }} style={styles.heroImage} contentFit="cover" />
      <View style={styles.heroOverlay} />

      <Pressable
        style={[styles.backBtn, { top: insets.top + spacing.sm }]}
        onPress={() => {
          void tapLight();
          router.back();
        }}
      >
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </Pressable>

      <View style={[styles.heroActions, { top: insets.top + spacing.sm }]}>
        <Pressable
          style={styles.heroActionBtn}
          onPress={() => {
            void selection();
            toggleSave(item.id);
          }}
        >
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color="#fff" />
        </Pressable>
        <Pressable
          style={styles.heroActionBtn}
          onPress={() => {
            void selection();
            openShare(item);
          }}
        >
          <Ionicons name="qr-code-outline" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sheet}
        style={styles.scroll}
      >
        <View style={styles.sheetInner}>
          <Text style={styles.category}>{getCategoryLabel(item.category)}</Text>
          {item.status ? (
            <Text style={styles.status}>{item.status === "published" ? "Published" : "Draft"}</Text>
          ) : null}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.meta}>
            {item.location} · {item.duration} · {item.stops} stops
          </Text>
          <TimelineView blocks={item.blocks} />
        </View>
      </ScrollView>

      <ShareSheet visible={shareVisible} item={shareItem} onClose={closeShare} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.warmWhite },
  center: { justifyContent: "center", alignItems: "center", padding: spacing.screen },
  heroImage: { position: "absolute", top: 0, left: 0, right: 0, height: 320 },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: "rgba(26, 43, 51, 0.35)",
  },
  backBtn: {
    position: "absolute",
    left: spacing.screen,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroActions: {
    position: "absolute",
    right: spacing.screen,
    zIndex: 10,
    flexDirection: "row",
    gap: spacing.sm,
  },
  heroActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  sheet: { paddingTop: 260, paddingBottom: spacing.xxxl },
  sheetInner: {
    backgroundColor: colors.warmWhite,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.screen,
    paddingTop: spacing.xxl,
    gap: spacing.sm,
    minHeight: 400,
  },
  category: typography.label,
  status: { ...typography.caption, color: colors.accentDeep },
  title: { fontSize: 28, fontWeight: "700", color: colors.ink, letterSpacing: -0.4 },
  subtitle: typography.body,
  meta: { ...typography.caption, marginBottom: spacing.xl },
  backLink: { color: colors.accentDeep, marginTop: spacing.lg },
});
