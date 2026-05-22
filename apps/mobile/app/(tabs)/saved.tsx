import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ItineraryCard } from "@/components/ItineraryCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { ShareSheet } from "@/components/ShareSheet";
import { SAMPLE_ITINERARIES } from "@/data/sample-itineraries";
import { useItineraryFeed } from "@/hooks/use-itinerary-feed";
import { useShareSheet } from "@/hooks/use-share-sheet";
import { spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { useSaved } from "@/stores/saved-store";

const TAB_BAR_SPACE = 100;

export default function SavedScreen() {
  const router = useRouter();
  const { savedIds, toggleSave } = useSaved();
  const { all } = useItineraryFeed();
  const { shareItem, shareVisible, openShare, closeShare } = useShareSheet();

  const catalog = useMemo(() => {
    const map = new Map<string, (typeof all)[0]>();
    for (const item of [...all, ...SAMPLE_ITINERARIES]) {
      map.set(item.id, item);
    }
    return map;
  }, [all]);

  const items = savedIds.map((id) => catalog.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <SectionHeader title="Saved" subtitle="Your calm travel library." />

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>A quiet archive awaits</Text>
          <Text style={styles.emptyBody}>
            Save itineraries from Home or Explore. They will appear here, beautifully organized.
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.id} style={styles.gridItem}>
              <ItineraryCard
                item={item}
                variant="grid"
                saved
                onPress={() => router.push(`/itinerary/${item.id}`)}
                onSave={() => toggleSave(item.id)}
                onShare={() => openShare(item)}
              />
            </View>
          ))}
        </View>
      )}

      <ShareSheet visible={shareVisible} item={shareItem} onClose={closeShare} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { padding: spacing.xxxl, gap: spacing.md, alignItems: "center" },
  emptyTitle: { ...typography.subtitle, textAlign: "center" },
  emptyBody: { ...typography.body, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  gridItem: { width: "48%" },
});
