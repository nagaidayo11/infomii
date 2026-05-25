import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { CardEditModal } from "@/components/CardEditModal";
import { CardPreview } from "@/components/CardPreview";
import { Screen } from "@/components/Screen";
import { clearCreateSession, getCreateSession, setCreateSession } from "@/lib/create-session";
import { fetchPageById, fetchPageCards, savePageCards } from "@/lib/pages-api";
import {
  createNewPageDraft,
  fetchItineraryById,
  publishItinerary,
  savePageDraft,
} from "@/lib/informations-api";
import { clearLocalDraft, loadLocalDraft, saveLocalDraft } from "@/lib/local-draft";
import { consumePendingPublishAfterAuth, setPendingPublishAfterAuth } from "@/lib/pending-auth";
import { hasSupabaseEnv } from "@/lib/supabase";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { selection, success, tapLight } from "@/lib/haptics";
import { useAuth } from "@/stores/auth-provider";
import {
  CARD_LIBRARY_ITEMS,
  createPlaceholderCard,
  isBusinessOnlyCard,
  newCardId,
  type CardType,
  type EditorCard,
} from "@/types/editor-card";

const TAB_BAR_SPACE = 100;

type PageState = {
  title: string;
  pageId: string;
  slug: string;
  informationId?: string;
  cards: EditorCard[];
};

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { pageId: pageIdParam, informationId: infoIdParam } = useLocalSearchParams<{
    pageId?: string;
    informationId?: string;
  }>();

  const [state, setState] = useState<PageState | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<EditorCard | null>(null);

  const hydratedRef = useRef(false);
  const skipFocusReloadRef = useRef(false);

  const syncSession = useCallback((next: PageState) => {
    setCreateSession({
      title: next.title,
      pageId: next.pageId,
      slug: next.slug,
      informationId: next.informationId,
      cards: next.cards,
    });
  }, []);

  const applyState = useCallback(
    (next: PageState) => {
      const sorted = [...next.cards].sort((a, b) => a.order - b.order);
      const normalized = { ...next, cards: sorted };
      setState(normalized);
      syncSession(normalized);
    },
    [syncSession],
  );

  const persistLocal = useCallback(async (next: PageState) => {
    await saveLocalDraft({
      title: next.title,
      pageId: next.pageId,
      slug: next.slug,
      informationId: next.informationId,
      cards: next.cards,
      updatedAt: new Date().toISOString(),
    });
    syncSession(next);
  }, [syncSession]);

  const initNewPage = useCallback(async () => {
    if (!user || !hasSupabaseEnv) {
      applyState({
        title: "わたしの一日プラン",
        pageId: `local-${Date.now()}`,
        slug: "local-draft",
        cards: [createPlaceholderCard("hero", newCardId(), 0)],
      });
      setLoading(false);
      return;
    }
    const created = await createNewPageDraft("わたしの一日プラン");
    const cards = await fetchPageCards(created.pageId);
    applyState({
      title: "わたしの一日プラン",
      pageId: created.pageId,
      slug: created.slug,
      informationId: created.informationId,
      cards: cards.length ? cards : [createPlaceholderCard("hero", newCardId(), 0)],
    });
    setLoading(false);
  }, [user, applyState]);

  useFocusEffect(
    useCallback(() => {
      if (skipFocusReloadRef.current) {
        skipFocusReloadRef.current = false;
        return;
      }

      if (hydratedRef.current) {
        const mem = getCreateSession();
        if (mem) {
          applyState({
            title: mem.title,
            pageId: mem.pageId,
            slug: mem.slug,
            informationId: mem.informationId,
            cards: mem.cards,
          });
        }
        return;
      }

      let active = true;

      (async () => {
        setLoading(true);

        const pid = typeof pageIdParam === "string" ? pageIdParam : null;
        const iid = typeof infoIdParam === "string" ? infoIdParam : null;

        if (pid && hasSupabaseEnv) {
          const [page, cards] = await Promise.all([fetchPageById(pid), fetchPageCards(pid)]);
          if (!active) return;
          const local = await loadLocalDraft();
          applyState({
            title: local?.title ?? page?.title ?? "しおり",
            pageId: pid,
            slug: local?.slug ?? page?.slug ?? "",
            informationId: local?.informationId ?? iid ?? undefined,
            cards,
          });
          hydratedRef.current = true;
          setLoading(false);
          return;
        }

        if (iid && hasSupabaseEnv) {
          const remote = await fetchItineraryById(iid);
          if (!active) return;
          if (remote?.pageId) {
            const cards = await fetchPageCards(remote.pageId);
            applyState({
              title: remote.title,
              pageId: remote.pageId,
              slug: remote.slug,
              informationId: remote.id,
              cards,
            });
            hydratedRef.current = true;
            setLoading(false);
            return;
          }
        }

        const local = await loadLocalDraft();
        if (!active) return;
        if (local?.pageId && !local.pageId.startsWith("local-")) {
          const cards = hasSupabaseEnv ? await fetchPageCards(local.pageId) : local.cards;
          applyState({
            title: local.title,
            pageId: local.pageId,
            slug: local.slug,
            informationId: local.informationId,
            cards: cards.length ? cards : local.cards,
          });
          hydratedRef.current = true;
          setLoading(false);
          return;
        }

        if (local) {
          applyState({
            title: local.title,
            pageId: local.pageId,
            slug: local.slug,
            informationId: local.informationId,
            cards: local.cards,
          });
          hydratedRef.current = true;
          setLoading(false);
          return;
        }

        const mem = getCreateSession();
        if (mem) {
          applyState({
            title: mem.title,
            pageId: mem.pageId,
            slug: mem.slug,
            informationId: mem.informationId,
            cards: mem.cards,
          });
          hydratedRef.current = true;
          setLoading(false);
          return;
        }

        await initNewPage();
        hydratedRef.current = true;
      })();

      return () => {
        active = false;
      };
    }, [pageIdParam, infoIdParam, applyState, initNewPage]),
  );

  useEffect(() => {
    if (!state) return;
    const t = setTimeout(() => {
      void persistLocal(state);
    }, 500);
    return () => clearTimeout(t);
  }, [state, persistLocal]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      if (await consumePendingPublishAfterAuth()) {
        await runPublish();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateCards = (cards: EditorCard[]) => {
    if (!state) return;
    const withOrder = cards.map((c, i) => ({ ...c, order: i }));
    applyState({ ...state, cards: withOrder });
  };

  const addCard = (type: CardType) => {
    if (!state) return;
    if (isBusinessOnlyCard(type)) {
      Alert.alert("Business 専用", "このカードは Web エディタで追加・編集してください。App では閲覧のみです。");
      return;
    }
    void selection();
    const card = createPlaceholderCard(type, newCardId(), state.cards.length);
    updateCards([...state.cards, card]);
  };

  const removeCard = (id: string) => {
    if (!state) return;
    void tapLight();
    updateCards(state.cards.filter((c) => c.id !== id));
  };

  const moveCard = (id: string, direction: -1 | 1) => {
    if (!state) return;
    const idx = state.cards.findIndex((c) => c.id === id);
    const next = idx + direction;
    if (idx < 0 || next < 0 || next >= state.cards.length) return;
    void selection();
    const copy = [...state.cards];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    updateCards(copy);
  };

  async function persistRemote(): Promise<{ informationId: string } | null> {
    if (!state) return null;
    if (!hasSupabaseEnv || !user) return null;
    if (state.pageId.startsWith("local-")) {
      const created = await createNewPageDraft(state.title);
      const merged = { ...state, ...created };
      const result = await savePageDraft({
        title: merged.title,
        pageId: merged.pageId,
        slug: merged.slug,
        informationId: merged.informationId,
        cards: merged.cards,
      });
      applyState({ ...merged, informationId: result.informationId });
      return { informationId: result.informationId };
    }
    const result = await savePageDraft({
      title: state.title,
      pageId: state.pageId,
      slug: state.slug,
      informationId: state.informationId,
      cards: state.cards,
    });
    applyState({ ...state, informationId: result.informationId });
    return { informationId: result.informationId };
  }

  async function runPublish() {
    if (!hasSupabaseEnv) {
      Alert.alert("Supabase 未設定", ".env に EXPO_PUBLIC_SUPABASE_* を設定してください。");
      return;
    }
    if (!user) {
      if (state) await persistLocal(state);
      await setPendingPublishAfterAuth(true);
      router.push("/auth");
      return;
    }
    setPublishing(true);
    try {
      const saved = await persistRemote();
      if (!saved) throw new Error("保存に失敗しました");
      await publishItinerary(saved.informationId);
      await clearLocalDraft();
      clearCreateSession();
      void success();
      router.push(`/itinerary/${saved.informationId}`);
    } catch (e) {
      Alert.alert("公開できませんでした", e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setPublishing(false);
    }
  }

  async function saveDraft() {
    if (!user || !hasSupabaseEnv) {
      if (state) await persistLocal(state);
      router.push("/auth");
      return;
    }
    setSaving(true);
    try {
      const saved = await persistRemote();
      if (!saved) throw new Error("保存に失敗しました");
      await clearLocalDraft();
      clearCreateSession();
      void success();
      router.push(`/itinerary/${saved.informationId}`);
    } catch (e) {
      Alert.alert("保存できませんでした", e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setSaving(false);
    }
  }

  function openWebEditor() {
    if (!state?.pageId || state.pageId.startsWith("local-")) {
      Alert.alert("ログインが必要です", "Web エディタを使うには下書き保存後に再度お試しください。");
      return;
    }
    skipFocusReloadRef.current = true;
    router.push({ pathname: "/editor/[pageId]", params: { pageId: state.pageId } });
  }

  function openPublicPreview() {
    if (!state?.slug || state.slug === "local-draft") {
      Alert.alert("プレビュー", "先に下書きを保存してください。");
      return;
    }
    skipFocusReloadRef.current = true;
    router.push({
      pathname: "/preview-public",
      params: { slug: state.slug, draft: "1" },
    });
  }

  async function saveCardsToServer() {
    if (!state || !user || state.pageId.startsWith("local-")) return;
    const { updatedIds } = await savePageCards(state.pageId, state.cards);
    if (Object.keys(updatedIds).length) {
      const next = state.cards.map((c) => (updatedIds[c.id] ? { ...c, id: updatedIds[c.id] } : c));
      applyState({ ...state, cards: next });
    }
  }

  if (loading || !state) {
    return (
      <Screen bottomInset={TAB_BAR_SPACE}>
        <ActivityIndicator color={colors.accentDeep} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  const uploadPrefix = user?.id ?? state.pageId ?? "temp";

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Text style={styles.hero}>作る</Text>
      <Text style={styles.sub}>
        Web と同じカードを編集します。カードをタップしてフォーム編集、公開プレビューは Web と同じ URL です。
      </Text>

      <Text style={styles.sectionLabel}>タイトル</Text>
      <TextInput
        style={styles.titleInput}
        value={state.title}
        onChangeText={(title) => applyState({ ...state, title })}
        placeholder="京都、静かな一日"
        placeholderTextColor={colors.inkFaint}
      />

      <View style={styles.actionRow}>
        <Pressable style={styles.secondaryBtn} onPress={() => void openPublicPreview()}>
          <Ionicons name="eye-outline" size={18} color={colors.accentDeep} />
          <Text style={styles.secondaryBtnText}>公開プレビュー</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={openWebEditor}>
          <Ionicons name="desktop-outline" size={18} color={colors.accentDeep} />
          <Text style={styles.secondaryBtnText}>Web エディタ</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>カード（{state.cards.length}）</Text>
      <ScrollView style={styles.cardList} nestedScrollEnabled>
        {state.cards.map((card, index) => {
          const businessViewOnly = isBusinessOnlyCard(card.type);
          return (
            <View key={card.id} style={styles.cardRow}>
              <View style={styles.cardActions}>
                <Pressable onPress={() => moveCard(card.id, -1)} disabled={index === 0}>
                  <Ionicons name="chevron-up" size={18} color={index === 0 ? colors.inkFaint : colors.ink} />
                </Pressable>
                <Pressable
                  onPress={() => moveCard(card.id, 1)}
                  disabled={index === state.cards.length - 1}
                >
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={index === state.cards.length - 1 ? colors.inkFaint : colors.ink}
                  />
                </Pressable>
                <Pressable onPress={() => removeCard(card.id)}>
                  <Ionicons name="trash-outline" size={18} color={colors.inkFaint} />
                </Pressable>
              </View>
              <Pressable
                style={styles.cardTap}
                onPress={() => {
                  void selection();
                  setEditingCard({ ...card, content: { ...card.content } });
                }}
              >
                <CardPreview card={card} businessLocked={businessViewOnly} />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {user && !state.pageId.startsWith("local-") ? (
        <Pressable style={styles.syncBtn} onPress={() => void saveCardsToServer()}>
          <Text style={styles.syncBtnText}>カード構成をサーバーに反映</Text>
        </Pressable>
      ) : null}

      <Text style={styles.sectionLabel}>カードを追加</Text>
      <View style={styles.chips}>
        {CARD_LIBRARY_ITEMS.filter((opt) => !isBusinessOnlyCard(opt.type)).map((opt) => (
          <Pressable key={opt.type} style={styles.chip} onPress={() => addCard(opt.type)}>
            <Ionicons name="add" size={14} color={colors.accentDeep} />
            <Text style={styles.chipText}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.primaryBtn, saving && styles.disabled]}
        onPress={() => void saveDraft()}
        disabled={saving || publishing}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryBtnText}>{user ? "下書きを保存" : "ログインして下書き保存"}</Text>
        )}
      </Pressable>

      <Pressable
        style={[styles.publishBtn, publishing && styles.disabled]}
        onPress={() => void runPublish()}
        disabled={saving || publishing}
      >
        {publishing ? (
          <ActivityIndicator color={colors.accentDeep} />
        ) : (
          <Text style={styles.publishBtnText}>
            {user ? "公開する（探すに載せる）" : "ログインして公開"}
          </Text>
        )}
      </Pressable>

      <CardEditModal
        visible={editingCard !== null}
        card={editingCard}
        uploadPrefix={uploadPrefix}
        readOnly={editingCard ? isBusinessOnlyCard(editingCard.type) : false}
        onClose={() => setEditingCard(null)}
        onSave={(updated) => {
          updateCards(state.cards.map((c) => (c.id === updated.id ? updated : c)));
          setEditingCard(null);
        }}
        onOpenWebEditor={openWebEditor}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: typography.hero,
  sub: { ...typography.body, marginBottom: spacing.lg },
  sectionLabel: { ...typography.label, marginBottom: spacing.md, textTransform: "none", fontSize: 13 },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.frost,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
    marginBottom: spacing.md,
    backgroundColor: colors.cardSolid,
  },
  actionRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentDeep,
    backgroundColor: colors.cardSolid,
  },
  secondaryBtnText: { fontSize: 13, fontWeight: "600", color: colors.accentDeep },
  cardList: { maxHeight: 360, marginBottom: spacing.md },
  cardRow: { marginBottom: spacing.md, gap: spacing.xs },
  cardActions: { flexDirection: "row", gap: spacing.md, alignSelf: "flex-end" },
  cardTap: { flex: 1 },
  syncBtn: { alignSelf: "center", marginBottom: spacing.lg },
  syncBtnText: { fontSize: 13, color: colors.accentDeep, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xxl },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.aqua,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.ink },
  primaryBtn: {
    backgroundColor: colors.accentDeep,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  publishBtn: {
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.accentDeep,
    marginBottom: spacing.lg,
  },
  publishBtnText: { color: colors.accentDeep, fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.6 },
});
