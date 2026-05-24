import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { ItineraryCard } from "@/components/ItineraryCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { ShareSheet } from "@/components/ShareSheet";
import { SAMPLE_ITINERARIES, getItineraryById } from "@/data/sample-itineraries";
import { useItineraryFeed } from "@/hooks/use-itinerary-feed";
import { useShareSheet } from "@/hooks/use-share-sheet";
import { saveKeyFromCard, targetFromKey } from "@/lib/information-saves-api";
import { fetchItineraryById, isRemoteItineraryId } from "@/lib/informations-api";
import { spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { colors } from "@/design/colors";
import { radius } from "@/design/spacing";
import { useAuth } from "@/stores/auth-provider";
import { useSaved } from "@/stores/saved-store";
import type { ItineraryCard as Card } from "@/types/itinerary";

const TAB_BAR_SPACE = 100;

export default function SavedScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { savedKeys, toggleSave, refreshSaves, ready } = useSaved();
  const { remote } = useItineraryFeed();
  const { shareItem, shareVisible, openShare, closeShare } = useShareSheet();
  const [fetched, setFetched] = useState<Card[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const loadItems = useCallback(async () => {
    if (!user || !savedKeys.length) {
      setFetched([]);
      return;
    }
    setLoadingItems(true);
    const items: Card[] = [];
    for (const key of savedKeys) {
      const target = targetFromKey(key);
      if (!target) continue;
      if (target.sampleId) {
        const sample = getItineraryById(target.sampleId);
        if (sample) items.push(sample);
        continue;
      }
      if (target.informationId) {
        const cached = remote.find((r) => r.id === target.informationId);
        if (cached) {
          items.push(cached);
          continue;
        }
        if (isRemoteItineraryId(target.informationId)) {
          const row = await fetchItineraryById(target.informationId);
          if (row) items.push(row);
        }
      }
    }
    setFetched(items);
    setLoadingItems(false);
  }, [user, savedKeys, remote]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (user) void refreshSaves();
  }, [user, refreshSaves]);

  const catalog = useMemo(() => {
    const map = new Map<string, Card>();
    for (const item of [...remote, ...SAMPLE_ITINERARIES, ...fetched]) {
      map.set(saveKeyFromCard(item), item);
    }
    return map;
  }, [remote, fetched]);

  const items = savedKeys
    .map((key) => catalog.get(key))
    .filter((item): item is Card => Boolean(item));

  if (authLoading) {
    return (
      <Screen bottomInset={TAB_BAR_SPACE}>
        <ActivityIndicator color={colors.accentDeep} />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen bottomInset={TAB_BAR_SPACE}>
        <SectionHeader title="保存" subtitle="ログインすると、しおりをライブラリに残せます。" />
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>ログインして保存</Text>
          <Text style={styles.emptyBody}>
            気に入ったしおりはブックマークで保存。端末を替えても同期されます。
          </Text>
          <Pressable style={styles.cta} onPress={() => router.push("/auth")}>
            <Text style={styles.ctaText}>ログイン・新規登録</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <SectionHeader title="保存" subtitle="あなたの旅のライブラリ。" />

      {(!ready || loadingItems) && items.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={colors.accentDeep} />
      ) : null}

      {items.length === 0 && ready && !loadingItems ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>静かなアーカイブが待っています</Text>
          <Text style={styles.emptyBody}>
            ホームや「探す」でブックマークすると、ここに集まります。
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={saveKeyFromCard(item)} style={styles.gridItem}>
              <ItineraryCard
                item={item}
                variant="grid"
                saved
                onPress={() => router.push(`/itinerary/${item.id}`)}
                onSave={() => void toggleSave(item)}
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
  loader: { marginVertical: spacing.xl },
  empty: { padding: spacing.xxxl, gap: spacing.md, alignItems: "center" },
  emptyTitle: { ...typography.subtitle, textAlign: "center" },
  emptyBody: { ...typography.body, textAlign: "center" },
  cta: {
    marginTop: spacing.lg,
    backgroundColor: colors.accentDeep,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
  },
  ctaText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  gridItem: { width: "48%" },
});
