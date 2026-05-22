import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "@/components/Screen";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { createDraftItinerary } from "@/lib/informations-api";
import { selection, success, tapLight } from "@/lib/haptics";
import { hasSupabaseEnv } from "@/lib/supabase";
import { useAuth } from "@/stores/auth-provider";
import type { DraftBlock, ItineraryBlockType } from "@/types/itinerary";

const TAB_BAR_SPACE = 100;

const BLOCK_OPTIONS: { type: ItineraryBlockType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: "hero", label: "Cover", icon: "image-outline" },
  { type: "schedule", label: "Timeline", icon: "time-outline" },
  { type: "checklist", label: "Packing", icon: "checkbox-outline" },
  { type: "steps", label: "Steps", icon: "footsteps-outline" },
  { type: "map", label: "Map", icon: "map-outline" },
  { type: "nearby", label: "Places", icon: "location-outline" },
  { type: "notice", label: "Note", icon: "document-text-outline" },
];

function newBlock(type: ItineraryBlockType): DraftBlock {
  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title: BLOCK_OPTIONS.find((b) => b.type === type)?.label ?? "Block",
  };
}

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("My Calm Day");
  const [blocks, setBlocks] = useState<DraftBlock[]>([
    { id: "draft-hero", type: "hero", title: "Cover" },
    { id: "draft-schedule", type: "schedule", title: "Timeline" },
  ]);
  const [saving, setSaving] = useState(false);

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

  async function saveDraft() {
    if (!hasSupabaseEnv) {
      Alert.alert("Supabase 未設定", ".env に EXPO_PUBLIC_SUPABASE_* を設定してください。");
      return;
    }
    if (!user) {
      router.push("/auth");
      return;
    }

    setSaving(true);
    try {
      const id = await createDraftItinerary(title, blocks);
      void success();
      router.push(`/itinerary/${id}`);
    } catch (e) {
      Alert.alert("保存できませんでした", e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Text style={styles.hero}>Create</Text>
      <Text style={styles.sub}>Web と同じ content_blocks 形式で下書き保存。</Text>

      <Text style={styles.sectionLabel}>タイトル</Text>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Kyoto Calm Day"
        placeholderTextColor={colors.inkFaint}
      />

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Your card</Text>
        <Text style={styles.previewTitle}>{title}</Text>
        <Text style={styles.previewMeta}>
          {blocks.length} blocks · {user ? "sync ready" : "local preview"}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Blocks</Text>
      <View style={styles.blockList}>
        {blocks.map((block, index) => (
          <View key={block.id} style={styles.blockRow}>
            <Ionicons
              name={BLOCK_OPTIONS.find((b) => b.type === block.type)?.icon ?? "cube-outline"}
              size={20}
              color={colors.accentDeep}
            />
            <Text style={styles.blockTitle}>{block.title}</Text>
            <View style={styles.blockActions}>
              <Pressable onPress={() => moveBlock(block.id, -1)} disabled={index === 0}>
                <Ionicons name="chevron-up" size={18} color={index === 0 ? colors.inkFaint : colors.ink} />
              </Pressable>
              <Pressable onPress={() => moveBlock(block.id, 1)} disabled={index === blocks.length - 1}>
                <Ionicons name="chevron-down" size={18} color={index === blocks.length - 1 ? colors.inkFaint : colors.ink} />
              </Pressable>
              <Pressable onPress={() => removeBlock(block.id)}>
                <Ionicons name="close" size={18} color={colors.inkFaint} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Add block</Text>
      <View style={styles.chips}>
        {BLOCK_OPTIONS.map((opt) => (
          <Pressable key={opt.type} style={styles.chip} onPress={() => addBlock(opt.type)}>
            <Ionicons name={opt.icon} size={16} color={colors.accentDeep} />
            <Text style={styles.chipText}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.primaryBtn, saving && styles.disabled]} onPress={() => void saveDraft()} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryBtnText}>{user ? "Supabase に下書き保存" : "ログインして保存"}</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.secondaryBtn}
        onPress={() => {
          void tapLight();
          router.push("/itinerary/kyoto-calm-day");
        }}
      >
        <Text style={styles.secondaryBtnText}>サンプルをプレビュー</Text>
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
    marginBottom: spacing.xl,
    backgroundColor: colors.cardSolid,
  },
  previewCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.xs,
  },
  previewLabel: typography.label,
  previewTitle: { fontSize: 24, fontWeight: "700", color: colors.ink },
  previewMeta: typography.caption,
  blockList: { gap: spacing.sm, marginBottom: spacing.xxl },
  blockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.cardSolid,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  blockTitle: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.ink },
  blockActions: { flexDirection: "row", gap: spacing.md },
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
  secondaryBtn: {
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.frost,
  },
  secondaryBtnText: { color: colors.inkMuted, fontWeight: "600" },
  disabled: { opacity: 0.6 },
});
