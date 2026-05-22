import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ExploreDeck } from "@/components/ExploreDeck";
import { Screen } from "@/components/Screen";
import { ShareSheet } from "@/components/ShareSheet";
import { useItineraryFeed } from "@/hooks/use-itinerary-feed";
import { useShareSheet } from "@/hooks/use-share-sheet";
import { spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { useSaved } from "@/stores/saved-store";

const TAB_BAR_SPACE = 100;

export default function ExploreScreen() {
  const router = useRouter();
  const { savedIds, toggleSave } = useSaved();
  const { all, loading } = useItineraryFeed();
  const { shareItem, shareVisible, openShare, closeShare } = useShareSheet();

  return (
    <Screen scroll={false} bottomInset={TAB_BAR_SPACE} padded={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Collect beautiful days. Swipe gently.</Text>
      </View>
      {loading ? <ActivityIndicator style={styles.loader} color="#5A9BB0" /> : null}
      <ExploreDeck
        items={all}
        savedIds={savedIds}
        onOpen={(id) => router.push(`/itinerary/${id}`)}
        onToggleSave={toggleSave}
        onShare={openShare}
      />
      <ShareSheet visible={shareVisible} item={shareItem} onClose={closeShare} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: typography.hero,
  subtitle: typography.body,
  loader: { marginBottom: spacing.md },
});
