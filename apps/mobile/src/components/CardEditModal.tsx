import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CardContentForm } from "@/components/card-form/CardContentForm";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { selection } from "@/lib/haptics";
import { cardTypeLabel, type EditorCard } from "@/types/editor-card";

type Props = {
  visible: boolean;
  card: EditorCard | null;
  uploadPrefix: string;
  readOnly?: boolean;
  onClose: () => void;
  onSave: (card: EditorCard) => void;
  onOpenWebEditor?: () => void;
};

export function CardEditModal({
  visible,
  card,
  uploadPrefix,
  readOnly,
  onClose,
  onSave,
  onOpenWebEditor,
}: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<EditorCard | null>(null);

  useEffect(() => {
    if (card) {
      setDraft({
        ...card,
        content: { ...card.content },
      });
    } else {
      setDraft(null);
    }
  }, [card, visible]);

  if (!draft) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.bar}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.cancel}>閉じる</Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {cardTypeLabel(draft.type)}
          </Text>
          <Pressable
            onPress={() => {
              if (readOnly) {
                onClose();
                onOpenWebEditor?.();
                return;
              }
              void selection();
              onSave(draft);
            }}
            hitSlop={12}
          >
            <Text style={styles.save}>{readOnly ? "Web" : "完了"}</Text>
          </Pressable>
        </View>

        {readOnly ? (
          <Text style={styles.hint}>Business 専用カードは App では閲覧のみです。Web エディタで編集してください。</Text>
        ) : (
          <Text style={styles.hint}>Web エディタと同じ content 形式で保存されます。</Text>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <CardContentForm
            card={draft}
            uploadPrefix={uploadPrefix}
            readOnly={readOnly}
            onChange={(content) => setDraft({ ...draft, content })}
          />

          {onOpenWebEditor && !readOnly ? (
            <Pressable
              style={styles.webLink}
              onPress={() => {
                onSave(draft);
                onClose();
                onOpenWebEditor();
              }}
            >
              <Ionicons name="desktop-outline" size={18} color={colors.accentDeep} />
              <Text style={styles.webLinkText}>高度な設定は Web エディタで</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.warmWhite },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.frost,
  },
  cancel: { fontSize: 16, color: colors.inkMuted, width: 56 },
  title: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700", color: colors.ink },
  save: { fontSize: 16, fontWeight: "700", color: colors.accentDeep, width: 56, textAlign: "right" },
  hint: {
    fontSize: 12,
    color: colors.inkFaint,
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.sm,
    lineHeight: 18,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingBottom: spacing.xxxl },
  webLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentDeep,
  },
  webLinkText: { fontSize: 14, fontWeight: "600", color: colors.accentDeep },
});
