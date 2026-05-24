import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "@/components/Screen";
import { getTemplateById, templateToDraftBlocks } from "@/data/templates";
import {
  publishItinerary,
  upsertDraftFromLocal,
} from "@/lib/informations-api";
import {
  clearLocalDraft,
  loadLocalDraft,
  saveLocalDraft,
} from "@/lib/local-draft";
import { consumePendingPublishAfterAuth, setPendingPublishAfterAuth } from "@/lib/pending-auth";
import { hasSupabaseEnv } from "@/lib/supabase";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { selection, success, tapLight } from "@/lib/haptics";
import { useAuth } from "@/stores/auth-provider";
import type { DraftBlock, ItineraryBlockType } from "@/types/itinerary";

const TAB_BAR_SPACE = 100;

const BLOCK_OPTIONS: { type: ItineraryBlockType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: "hero", label: "カバー", icon: "image-outline" },
  { type: "schedule", label: "タイムライン", icon: "time-outline" },
  { type: "checklist", label: "持ち物", icon: "checkbox-outline" },
  { type: "steps", label: "ステップ", icon: "footsteps-outline" },
  { type: "map", label: "地図", icon: "map-outline" },
  { type: "nearby", label: "スポット", icon: "location-outline" },
  { type: "notice", label: "メモ", icon: "document-text-outline" },
];

function newBlock(type: ItineraryBlockType): DraftBlock {
  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title: BLOCK_OPTIONS.find((b) => b.type === type)?.label ?? "ブロック",
  };
}

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const [title, setTitle] = useState("わたしの一日プラン");
  const [blocks, setBlocks] = useState<DraftBlock[]>([
    { id: "draft-hero", type: "hero", title: "カバー", body: "" },
    { id: "draft-schedule", type: "schedule", title: "タイムライン", body: "10:00 最初の予定" },
  ]);
  const [remoteId, setRemoteId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const persistLocal = useCallback(async () => {
    await saveLocalDraft({ title, blocks, remoteId, updatedAt: new Date().toISOString() });
  }, [title, blocks, remoteId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (typeof templateId === "string" && templateId) {
          const tpl = getTemplateById(templateId);
          if (!active) return;
          if (tpl) {
            setTitle(tpl.title);
            setBlocks(templateToDraftBlocks(tpl));
          }
          return;
        }
        const local = await loadLocalDraft();
        if (!active) return;
        if (local) {
          setTitle(local.title);
          setBlocks(local.blocks);
          setRemoteId(local.remoteId);
        }
      })();
      return () => {
        active = false;
      };
    }, [templateId]),
  );

  useEffect(() => {
    const t = setTimeout(() => {
      void persistLocal();
    }, 400);
    return () => clearTimeout(t);
  }, [persistLocal]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const shouldPublish = await consumePendingPublishAfterAuth();
      if (shouldPublish) {
        await runPublish();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateBlock = (id: string, patch: Partial<DraftBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const addBlock = (type: ItineraryBlockType) => {
    void selection();
    setBlocks((prev) => [...prev, newBlock(type)]);
  };

  const removeBlock = (id: string) => {
    void tapLight();
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    void selection();
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      const next = idx + direction;
      if (idx < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  };

  async function runPublish() {
    if (!hasSupabaseEnv) {
      Alert.alert("Supabase 未設定", ".env に EXPO_PUBLIC_SUPABASE_* を設定してください。");
      return;
    }
    if (!user) {
      await persistLocal();
      await setPendingPublishAfterAuth(true);
      router.push("/auth");
      return;
    }

    setPublishing(true);
    try {
      const id = await upsertDraftFromLocal(title, blocks, remoteId);
      setRemoteId(id);
      await publishItinerary(id);
      await clearLocalDraft();
      void success();
      router.push(`/itinerary/${id}`);
    } catch (e) {
      Alert.alert("公開できませんでした", e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setPublishing(false);
    }
  }

  async function saveDraft() {
    if (!hasSupabaseEnv) {
      Alert.alert("Supabase 未設定", ".env に EXPO_PUBLIC_SUPABASE_* を設定してください。");
      return;
    }
    if (!user) {
      await persistLocal();
      router.push("/auth");
      return;
    }

    setSaving(true);
    try {
      const id = await upsertDraftFromLocal(title, blocks, remoteId);
      setRemoteId(id);
      await clearLocalDraft();
      void success();
      router.push(`/itinerary/${id}`);
    } catch (e) {
      Alert.alert("保存できませんでした", e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setSaving(false);
    }
  }

  function openPreview() {
    router.push({
      pathname: "/preview",
      params: {
        title,
        blocks: JSON.stringify(blocks),
      },
    });
  }

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Text style={styles.hero}>作る</Text>
      <Text style={styles.sub}>
        {user ? "下書き保存・公開ができます。" : "ゲストでも編集できます。公開するときだけログイン。"}
      </Text>

      <Text style={styles.sectionLabel}>タイトル</Text>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="京都、静かな一日"
        placeholderTextColor={colors.inkFaint}
      />

      <Pressable style={styles.previewBtn} onPress={openPreview}>
        <Ionicons name="eye-outline" size={18} color={colors.accentDeep} />
        <Text style={styles.previewBtnText}>編集中のしおりをプレビュー</Text>
      </Pressable>

      <Text style={styles.sectionLabel}>ブロック</Text>
      <View style={styles.blockList}>
        {blocks.map((block, index) => (
          <View key={block.id} style={styles.blockCard}>
            <View style={styles.blockRow}>
              <Ionicons
                name={BLOCK_OPTIONS.find((b) => b.type === block.type)?.icon ?? "cube-outline"}
                size={20}
                color={colors.accentDeep}
              />
              <TextInput
                style={styles.blockTitleInput}
                value={block.title}
                onChangeText={(text) => updateBlock(block.id, { title: text })}
                placeholder="ブロック名"
                placeholderTextColor={colors.inkFaint}
              />
              <View style={styles.blockActions}>
                <Pressable onPress={() => moveBlock(block.id, -1)} disabled={index === 0}>
                  <Ionicons name="chevron-up" size={18} color={index === 0 ? colors.inkFaint : colors.ink} />
                </Pressable>
                <Pressable onPress={() => moveBlock(block.id, 1)} disabled={index === blocks.length - 1}>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={index === blocks.length - 1 ? colors.inkFaint : colors.ink}
                  />
                </Pressable>
                <Pressable onPress={() => removeBlock(block.id)}>
                  <Ionicons name="close" size={18} color={colors.inkFaint} />
                </Pressable>
              </View>
            </View>
            <TextInput
              style={styles.blockBodyInput}
              value={block.body ?? ""}
              onChangeText={(text) => updateBlock(block.id, { body: text })}
              placeholder={
                block.type === "schedule"
                  ? "例: 10:00 京都駅集合"
                  : block.type === "checklist"
                    ? "例: 充電器"
                    : "内容を入力"
              }
              placeholderTextColor={colors.inkFaint}
              multiline
            />
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>ブロックを追加</Text>
      <View style={styles.chips}>
        {BLOCK_OPTIONS.map((opt) => (
          <Pressable key={opt.type} style={styles.chip} onPress={() => addBlock(opt.type)}>
            <Ionicons name={opt.icon} size={16} color={colors.accentDeep} />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: typography.hero,
  sub: { ...typography.body, marginBottom: spacing.xl },
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
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  previewBtnText: { fontSize: 15, fontWeight: "600", color: colors.accentDeep },
  blockList: { gap: spacing.md, marginBottom: spacing.xxl },
  blockCard: {
    backgroundColor: colors.cardSolid,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.md,
    gap: spacing.sm,
  },
  blockRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  blockTitleInput: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.ink },
  blockBodyInput: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
    minHeight: 44,
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
  },
  blockActions: { flexDirection: "row", gap: spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xxl },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.aqua,
  },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.ink },
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
