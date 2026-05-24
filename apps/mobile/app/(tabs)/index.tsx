import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { HorizontalSection } from "@/components/HorizontalSection";
import { ItineraryCard } from "@/components/ItineraryCard";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { ShareSheet } from "@/components/ShareSheet";
import { useItineraryFeed } from "@/hooks/use-itinerary-feed";
import { useShareSheet } from "@/hooks/use-share-sheet";
import { fetchMyDraftItineraries } from "@/lib/informations-api";
import { loadLocalDraft, type LocalDraft } from "@/lib/local-draft";
import { spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { useAuth } from "@/stores/auth-provider";
import { useSaved } from "@/stores/saved-store";

const TAB_BAR_SPACE = 100;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSaved();
  const { featured, templates, loading, error, hasRemote } = useItineraryFeed();
  const { shareItem, shareVisible, openShare, closeShare } = useShareSheet();
  const [continueDraft, setContinueDraft] = useState<LocalDraft | null>(null);
  const [remoteDraftTitle, setRemoteDraftTitle] = useState<string | null>(null);

  const loadContinue = useCallback(async () => {
    const local = await loadLocalDraft();
    if (local) {
      setContinueDraft(local);
      setRemoteDraftTitle(null);
      return;
    }
    if (user) {
      const drafts = await fetchMyDraftItineraries();
      const draft = drafts.find((d) => d.status === "draft");
      if (draft) {
        setRemoteDraftTitle(draft.title);
        setContinueDraft(null);
        return;
      }
    }
    setContinueDraft(null);
    setRemoteDraftTitle(null);
  }, [user]);

  useEffect(() => {
    void loadContinue();
  }, [loadContinue]);

  const open = (id: string) => router.push(`/itinerary/${id}`);

  const continueTitle = continueDraft?.title ?? remoteDraftTitle;

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <SectionHeader title="Infomii" subtitle="一日ひとつ、美しく整えた旅のしおり。" />

      {loading && !hasRemote ? (
        <ActivityIndicator style={styles.loader} color="#5A9BB0" />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {continueTitle ? (
        <Pressable
          style={styles.continueCard}
          onPress={() => router.push("/(tabs)/create")}
        >
          <Text style={styles.continueLabel}>続きから編集</Text>
          <Text style={styles.continueTitle} numberOfLines={1}>
            {continueTitle}
          </Text>
          <Text style={styles.continueMeta}>タップして作る画面を開く</Text>
        </Pressable>
      ) : null}

      <HorizontalSection title="注目のしおり" subtitle="保存が多い順・公式サンプル含む">
        {featured.map((item) => (
          <ItineraryCard
            key={item.id}
            item={item}
            variant="featured"
            saved={isSaved(item)}
            onPress={() => open(item.id)}
            onSave={() => void toggleSave(item)}
            onShare={() => openShare(item)}
          />
        ))}
      </HorizontalSection>

      <HorizontalSection title="人気のテンプレート" subtitle="選んで、自分のしおりの土台に">
        {templates.map((item) => (
          <ItineraryCard
            key={item.id}
            item={item}
            saved={isSaved(item)}
            onPress={() =>
              router.push({ pathname: "/(tabs)/create", params: { templateId: item.id } })
            }
            onSave={() => void toggleSave(item)}
            onShare={() => openShare(item)}
          />
        ))}
      </HorizontalSection>

      <ShareSheet visible={shareVisible} item={shareItem} onClose={closeShare} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginBottom: spacing.lg },
  error: { ...typography.caption, color: "#D4847A", marginBottom: spacing.md },
  continueCard: {
    marginBottom: spacing.section,
    padding: spacing.xl,
    borderRadius: 16,
    backgroundColor: "rgba(90, 155, 176, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(90, 155, 176, 0.25)",
    gap: spacing.xs,
  },
  continueLabel: { ...typography.label, color: "#5A7280" },
  continueTitle: { fontSize: 18, fontWeight: "700", color: "#1A2B33" },
  continueMeta: { ...typography.caption, color: "#5A7280" },
});
