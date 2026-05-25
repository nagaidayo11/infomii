import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ImagePickUpload } from "@/components/ImagePickUpload";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import {
  emptyGalleryRow,
  emptyNearbyRow,
  emptyPricingRow,
  emptyScheduleRow,
  emptyStepRow,
} from "@/lib/draft-normalize";
import { selection } from "@/lib/haptics";
import { BADGE_COLOR_PRESETS, type DraftBlock, type DraftGalleryItem, type DraftPricingItem, type ScheduleItem } from "@/types/itinerary";

type Props = {
  block: DraftBlock;
  onChange: (patch: Partial<DraftBlock>) => void;
  uploadPrefix: string;
};

function RowActions({
  onUp,
  onDown,
  onRemove,
  canUp,
  canDown,
}: {
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
  canUp: boolean;
  canDown: boolean;
}) {
  return (
    <View style={styles.rowActions}>
      <Pressable onPress={onUp} disabled={!canUp} hitSlop={6}>
        <Ionicons name="chevron-up" size={16} color={canUp ? colors.ink : colors.inkFaint} />
      </Pressable>
      <Pressable onPress={onDown} disabled={!canDown} hitSlop={6}>
        <Ionicons name="chevron-down" size={16} color={canDown ? colors.ink : colors.inkFaint} />
      </Pressable>
      <Pressable onPress={onRemove} hitSlop={6}>
        <Ionicons name="trash-outline" size={16} color={colors.inkFaint} />
      </Pressable>
    </View>
  );
}

export function DraftBlockEditor({ block, onChange, uploadPrefix }: Props) {
  if (block.type === "hero") {
    return (
      <View style={styles.list}>
        <ImagePickUpload
          value={block.imageUrl}
          onChange={(imageUrl) => onChange({ imageUrl })}
          uploadPrefix={uploadPrefix}
          label="カバー画像"
          height={180}
        />
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={block.body ?? ""}
          onChangeText={(body) => onChange({ body })}
          placeholder="カバー見出し・サブタイトル"
          placeholderTextColor={colors.inkFaint}
          multiline
        />
      </View>
    );
  }

  if (block.type === "quote") {
    return (
      <View style={styles.list}>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={block.body ?? ""}
          onChangeText={(body) => onChange({ body })}
          placeholder="引用文"
          placeholderTextColor={colors.inkFaint}
          multiline
        />
        <TextInput
          style={styles.input}
          value={block.quoteAuthor ?? ""}
          onChangeText={(quoteAuthor) => onChange({ quoteAuthor })}
          placeholder="著者（任意）"
          placeholderTextColor={colors.inkFaint}
        />
      </View>
    );
  }

  if (block.type === "gallery") {
    const items = block.galleryItems?.length ? block.galleryItems : [emptyGalleryRow()];
    const updateItem = (index: number, patch: Partial<DraftGalleryItem>) => {
      const next = items.map((row, i) => (i === index ? { ...row, ...patch } : row));
      onChange({ galleryItems: next });
    };
    const moveItem = (index: number, direction: -1 | 1) => {
      const next = index + direction;
      if (next < 0 || next >= items.length) return;
      void selection();
      const copy = [...items];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      onChange({ galleryItems: copy });
    };
    return (
      <View style={styles.list}>
        {items.map((row, index) => (
          <View key={`gal-${index}`} style={styles.rowCard}>
            <View style={styles.rowTop}>
              <Text style={styles.rowLabel}>写真 {index + 1}</Text>
              <RowActions
                canUp={index > 0}
                canDown={index < items.length - 1}
                onUp={() => moveItem(index, -1)}
                onDown={() => moveItem(index, 1)}
                onRemove={() => {
                  if (items.length <= 1) {
                    onChange({ galleryItems: [emptyGalleryRow()] });
                    return;
                  }
                  onChange({ galleryItems: items.filter((_, i) => i !== index) });
                }}
              />
            </View>
            <ImagePickUpload
              value={row.url || undefined}
              onChange={(url) => updateItem(index, { url: url ?? "" })}
              uploadPrefix={uploadPrefix}
              height={120}
            />
            <TextInput
              style={styles.input}
              value={row.caption ?? ""}
              onChangeText={(caption) => updateItem(index, { caption })}
              placeholder="キャプション（任意）"
              placeholderTextColor={colors.inkFaint}
            />
          </View>
        ))}
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            void selection();
            onChange({ galleryItems: [...items, emptyGalleryRow()] });
          }}
        >
          <Ionicons name="add" size={18} color={colors.accentDeep} />
          <Text style={styles.addBtnText}>写真を追加</Text>
        </Pressable>
      </View>
    );
  }

  if (block.type === "pricing") {
    const items = block.pricingItems?.length ? block.pricingItems : [emptyPricingRow()];
    const updateItem = (index: number, patch: Partial<DraftPricingItem>) => {
      const next = items.map((row, i) => (i === index ? { ...row, ...patch } : row));
      onChange({ pricingItems: next });
    };
    const moveItem = (index: number, direction: -1 | 1) => {
      const next = index + direction;
      if (next < 0 || next >= items.length) return;
      void selection();
      const copy = [...items];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      onChange({ pricingItems: copy });
    };
    return (
      <View style={styles.list}>
        {items.map((row, index) => (
          <View key={`price-${index}`} style={styles.rowCard}>
            <View style={styles.rowTop}>
              <Text style={styles.rowLabel}>行 {index + 1}</Text>
              <RowActions
                canUp={index > 0}
                canDown={index < items.length - 1}
                onUp={() => moveItem(index, -1)}
                onDown={() => moveItem(index, 1)}
                onRemove={() => {
                  if (items.length <= 1) {
                    onChange({ pricingItems: [emptyPricingRow()] });
                    return;
                  }
                  onChange({ pricingItems: items.filter((_, i) => i !== index) });
                }}
              />
            </View>
            <TextInput
              style={styles.input}
              value={row.label}
              onChangeText={(label) => updateItem(index, { label })}
              placeholder="項目名"
              placeholderTextColor={colors.inkFaint}
            />
            <TextInput
              style={styles.input}
              value={row.value}
              onChangeText={(value) => updateItem(index, { value })}
              placeholder="金額・内容"
              placeholderTextColor={colors.inkFaint}
            />
          </View>
        ))}
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            void selection();
            onChange({ pricingItems: [...items, emptyPricingRow()] });
          }}
        >
          <Ionicons name="add" size={18} color={colors.accentDeep} />
          <Text style={styles.addBtnText}>行を追加</Text>
        </Pressable>
      </View>
    );
  }

  if (block.type === "cta") {
    const url = block.ctaUrl?.trim();
    return (
      <View style={styles.list}>
        <TextInput
          style={styles.input}
          value={block.ctaLabel ?? ""}
          onChangeText={(ctaLabel) => onChange({ ctaLabel })}
          placeholder="ボタン文言"
          placeholderTextColor={colors.inkFaint}
        />
        <TextInput
          style={styles.input}
          value={block.ctaUrl ?? ""}
          onChangeText={(ctaUrl) => onChange({ ctaUrl })}
          placeholder="https://..."
          placeholderTextColor={colors.inkFaint}
          autoCapitalize="none"
          keyboardType="url"
        />
        {url ? (
          <Pressable style={styles.linkPreview} onPress={() => void Linking.openURL(url)}>
            <Text style={styles.linkPreviewText}>プレビューでリンクを開く</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (block.type === "badge") {
    return (
      <View style={styles.list}>
        <TextInput
          style={styles.input}
          value={block.badgeText ?? ""}
          onChangeText={(badgeText) => onChange({ badgeText })}
          placeholder="おすすめ・期間限定 など"
          placeholderTextColor={colors.inkFaint}
        />
        <Text style={styles.presetLabel}>色</Text>
        <View style={styles.presetRow}>
          {BADGE_COLOR_PRESETS.map((preset) => {
            const active = block.badgeColor === preset.bg;
            return (
              <Pressable
                key={preset.label}
                style={[
                  styles.presetChip,
                  { backgroundColor: preset.bg },
                  active && styles.presetChipActive,
                ]}
                onPress={() => {
                  void selection();
                  onChange({
                    badgeColor: preset.bg,
                    badgeTextColor: preset.text,
                  });
                }}
              >
                <Text style={[styles.presetChipText, { color: preset.text }]}>{preset.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View
          style={[
            styles.badgePreview,
            { backgroundColor: block.badgeColor ?? "#dcfce7" },
          ]}
        >
          <Text style={{ color: block.badgeTextColor ?? "#065f46", fontWeight: "700" }}>
            {block.badgeText || "プレビュー"}
          </Text>
        </View>
      </View>
    );
  }

  if (block.type === "schedule") {
    const items = block.scheduleItems?.length ? block.scheduleItems : [emptyScheduleRow()];
    const updateItem = (index: number, patch: Partial<ScheduleItem>) => {
      const next = items.map((row, i) => (i === index ? { ...row, ...patch } : row));
      onChange({ scheduleItems: next });
    };
    const moveItem = (index: number, direction: -1 | 1) => {
      const next = index + direction;
      if (next < 0 || next >= items.length) return;
      void selection();
      const copy = [...items];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      onChange({ scheduleItems: copy });
    };
    return (
      <View style={styles.list}>
        {items.map((row, index) => (
          <View key={`sched-${index}`} style={styles.rowCard}>
            <View style={styles.rowTop}>
              <Text style={styles.rowLabel}>行 {index + 1}</Text>
              <RowActions
                canUp={index > 0}
                canDown={index < items.length - 1}
                onUp={() => moveItem(index, -1)}
                onDown={() => moveItem(index, 1)}
                onRemove={() => {
                  if (items.length <= 1) {
                    onChange({ scheduleItems: [emptyScheduleRow()] });
                    return;
                  }
                  onChange({ scheduleItems: items.filter((_, i) => i !== index) });
                }}
              />
            </View>
            <TextInput
              style={styles.input}
              value={row.day}
              onChangeText={(day) => updateItem(index, { day })}
              placeholder="午前・1日目（任意）"
              placeholderTextColor={colors.inkFaint}
            />
            <TextInput
              style={styles.input}
              value={row.time}
              onChangeText={(time) => updateItem(index, { time })}
              placeholder="10:00"
              placeholderTextColor={colors.inkFaint}
            />
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={row.label}
              onChangeText={(label) => updateItem(index, { label })}
              placeholder="予定の内容"
              placeholderTextColor={colors.inkFaint}
              multiline
            />
          </View>
        ))}
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            void selection();
            onChange({ scheduleItems: [...items, emptyScheduleRow()] });
          }}
        >
          <Ionicons name="add" size={18} color={colors.accentDeep} />
          <Text style={styles.addBtnText}>行を追加</Text>
        </Pressable>
      </View>
    );
  }

  if (block.type === "checklist") {
    const items = block.checklistItems?.length ? block.checklistItems : [""];
    const updateItem = (index: number, text: string) => {
      const next = items.map((t, i) => (i === index ? text : t));
      onChange({ checklistItems: next });
    };
    const moveItem = (index: number, direction: -1 | 1) => {
      const next = index + direction;
      if (next < 0 || next >= items.length) return;
      void selection();
      const copy = [...items];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      onChange({ checklistItems: copy });
    };
    return (
      <View style={styles.list}>
        {items.map((text, index) => (
          <View key={`chk-${index}`} style={styles.rowCard}>
            <View style={styles.rowTop}>
              <Text style={styles.rowLabel}>項目 {index + 1}</Text>
              <RowActions
                canUp={index > 0}
                canDown={index < items.length - 1}
                onUp={() => moveItem(index, -1)}
                onDown={() => moveItem(index, 1)}
                onRemove={() => {
                  if (items.length <= 1) {
                    onChange({ checklistItems: [""] });
                    return;
                  }
                  onChange({ checklistItems: items.filter((_, i) => i !== index) });
                }}
              />
            </View>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={(v) => updateItem(index, v)}
              placeholder="持ち物・メモ"
              placeholderTextColor={colors.inkFaint}
            />
          </View>
        ))}
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            void selection();
            onChange({ checklistItems: [...items, ""] });
          }}
        >
          <Ionicons name="add" size={18} color={colors.accentDeep} />
          <Text style={styles.addBtnText}>行を追加</Text>
        </Pressable>
      </View>
    );
  }

  if (block.type === "nearby") {
    const items = block.nearby?.length ? block.nearby : [emptyNearbyRow()];
    const updateItem = (index: number, patch: Partial<(typeof items)[0]>) => {
      const next = items.map((row, i) => (i === index ? { ...row, ...patch } : row));
      onChange({ nearby: next });
    };
    const moveItem = (index: number, direction: -1 | 1) => {
      const next = index + direction;
      if (next < 0 || next >= items.length) return;
      void selection();
      const copy = [...items];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      onChange({ nearby: copy });
    };
    return (
      <View style={styles.list}>
        {items.map((row, index) => (
          <View key={`near-${index}`} style={styles.rowCard}>
            <View style={styles.rowTop}>
              <Text style={styles.rowLabel}>スポット {index + 1}</Text>
              <RowActions
                canUp={index > 0}
                canDown={index < items.length - 1}
                onUp={() => moveItem(index, -1)}
                onDown={() => moveItem(index, 1)}
                onRemove={() => {
                  if (items.length <= 1) {
                    onChange({ nearby: [emptyNearbyRow()] });
                    return;
                  }
                  onChange({ nearby: items.filter((_, i) => i !== index) });
                }}
              />
            </View>
            <TextInput
              style={styles.input}
              value={row.name}
              onChangeText={(name) => updateItem(index, { name })}
              placeholder="場所名"
              placeholderTextColor={colors.inkFaint}
            />
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={row.description}
              onChangeText={(description) => updateItem(index, { description })}
              placeholder="メモ・行き方"
              placeholderTextColor={colors.inkFaint}
              multiline
            />
          </View>
        ))}
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            void selection();
            onChange({ nearby: [...items, emptyNearbyRow()] });
          }}
        >
          <Ionicons name="add" size={18} color={colors.accentDeep} />
          <Text style={styles.addBtnText}>行を追加</Text>
        </Pressable>
      </View>
    );
  }

  if (block.type === "steps") {
    const items = block.steps?.length ? block.steps : [emptyStepRow()];
    const updateItem = (index: number, patch: Partial<(typeof items)[0]>) => {
      const next = items.map((row, i) => (i === index ? { ...row, ...patch } : row));
      onChange({ steps: next });
    };
    const moveItem = (index: number, direction: -1 | 1) => {
      const next = index + direction;
      if (next < 0 || next >= items.length) return;
      void selection();
      const copy = [...items];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      onChange({ steps: copy });
    };
    return (
      <View style={styles.list}>
        {items.map((row, index) => (
          <View key={`step-${index}`} style={styles.rowCard}>
            <View style={styles.rowTop}>
              <Text style={styles.rowLabel}>ステップ {index + 1}</Text>
              <RowActions
                canUp={index > 0}
                canDown={index < items.length - 1}
                onUp={() => moveItem(index, -1)}
                onDown={() => moveItem(index, 1)}
                onRemove={() => {
                  if (items.length <= 1) {
                    onChange({ steps: [emptyStepRow()] });
                    return;
                  }
                  onChange({ steps: items.filter((_, i) => i !== index) });
                }}
              />
            </View>
            <TextInput
              style={styles.input}
              value={row.title}
              onChangeText={(title) => updateItem(index, { title })}
              placeholder="見出し"
              placeholderTextColor={colors.inkFaint}
            />
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={row.description}
              onChangeText={(description) => updateItem(index, { description })}
              placeholder="説明"
              placeholderTextColor={colors.inkFaint}
              multiline
            />
          </View>
        ))}
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            void selection();
            onChange({ steps: [...items, emptyStepRow()] });
          }}
        >
          <Ionicons name="add" size={18} color={colors.accentDeep} />
          <Text style={styles.addBtnText}>行を追加</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <TextInput
      style={styles.bodyInput}
      value={block.body ?? ""}
      onChangeText={(body) => onChange({ body })}
      placeholder="内容を入力"
      placeholderTextColor={colors.inkFaint}
      multiline
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  rowCard: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: { fontSize: 12, fontWeight: "600", color: colors.inkFaint },
  rowActions: { flexDirection: "row", gap: spacing.sm },
  input: {
    fontSize: 14,
    color: colors.ink,
    padding: spacing.sm,
    backgroundColor: colors.warmWhite,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.frost,
  },
  inputMultiline: { minHeight: 56, textAlignVertical: "top" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
  },
  addBtnText: { fontSize: 14, fontWeight: "600", color: colors.accentDeep },
  presetLabel: { fontSize: 12, fontWeight: "600", color: colors.inkMuted },
  presetRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  presetChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: "transparent",
  },
  presetChipActive: { borderColor: colors.accentDeep },
  presetChipText: { fontSize: 11, fontWeight: "600" },
  badgePreview: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  linkPreview: { paddingVertical: spacing.xs },
  linkPreviewText: { fontSize: 14, fontWeight: "600", color: colors.accentDeep },
  bodyInput: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
    minHeight: 44,
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
  },
});
