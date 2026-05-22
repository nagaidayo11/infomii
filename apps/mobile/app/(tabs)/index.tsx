import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { HorizontalSection } from "@/components/HorizontalSection";
import { ItineraryCard } from "@/components/ItineraryCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { ShareSheet } from "@/components/ShareSheet";
import { useItineraryFeed } from "@/hooks/use-itinerary-feed";
import { useShareSheet } from "@/hooks/use-share-sheet";
import { spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { useSaved } from "@/stores/saved-store";

const TAB_BAR_SPACE = 100;

export default function HomeScreen() {
  const router = useRouter();
  const { isSaved, toggleSave, savedIds } = useSaved();
  const { featured, discover, popular, hotels, loading, error, hasRemote } = useItineraryFeed();
  const { shareItem, shareVisible, openShare, closeShare } = useShareSheet();

  const recentlySavedIds = savedIds;
  const allForSaved = [...featured, ...discover];
  const recentlySaved = allForSaved.filter((i) => recentlySavedIds.includes(i.id));

  const open = (id: string) => router.push(`/itinerary/${id}`);

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <SectionHeader
        title="Infomii"
        subtitle="Beautifully organized travel, one day at a time."
      />

      {loading && !hasRemote ? (
        <ActivityIndicator style={styles.loader} color="#5A9BB0" />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <HorizontalSection title="Featured Itineraries" subtitle="Curated calm days">
        {featured.map((item) => (
          <ItineraryCard
            key={item.id}
            item={item}
            variant="featured"
            saved={isSaved(item.id)}
            onPress={() => open(item.id)}
            onSave={() => toggleSave(item.id)}
            onShare={() => openShare(item)}
          />
        ))}
      </HorizontalSection>

      <HorizontalSection title="Discover" subtitle="Swipe-worthy inspiration">
        {discover.map((item) => (
          <ItineraryCard
            key={item.id}
            item={item}
            saved={isSaved(item.id)}
            onPress={() => open(item.id)}
            onSave={() => toggleSave(item.id)}
            onShare={() => openShare(item)}
          />
        ))}
      </HorizontalSection>

      <HorizontalSection title="Popular Travel Cards">
        {popular.map((item) => (
          <ItineraryCard
            key={item.id}
            item={item}
            saved={isSaved(item.id)}
            onPress={() => open(item.id)}
            onSave={() => toggleSave(item.id)}
            onShare={() => openShare(item)}
          />
        ))}
      </HorizontalSection>

      <HorizontalSection title="Calm Hotel Guides">
        {hotels.map((item) => (
          <ItineraryCard
            key={item.id}
            item={item}
            saved={isSaved(item.id)}
            onPress={() => open(item.id)}
            onSave={() => toggleSave(item.id)}
            onShare={() => openShare(item)}
          />
        ))}
      </HorizontalSection>

      {recentlySaved.length > 0 ? (
        <HorizontalSection title="Recently Saved">
          {recentlySaved.map((item) => (
            <ItineraryCard
              key={item.id}
              item={item}
              saved
              onPress={() => open(item.id)}
              onSave={() => toggleSave(item.id)}
              onShare={() => openShare(item)}
            />
          ))}
        </HorizontalSection>
      ) : (
        <View style={styles.emptySaved}>
          <Text style={styles.emptyTitle}>Nothing saved yet</Text>
          <Text style={styles.emptyBody}>Tap the bookmark on any card to start your library.</Text>
        </View>
      )}

      <ShareSheet visible={shareVisible} item={shareItem} onClose={closeShare} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginBottom: spacing.lg },
  error: { ...typography.caption, color: "#D4847A", marginBottom: spacing.md },
  emptySaved: { marginBottom: spacing.section, padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { fontSize: 17, fontWeight: "600", color: "#1A2B33" },
  emptyBody: { fontSize: 14, color: "#5A7280", lineHeight: 20 },
});
