import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { APP_PUBLIC_URL } from "@/lib/config";
import {
  cardTypeLabel,
  isBusinessOnlyCard,
  type EditorCard,
} from "@/types/editor-card";

function resolveImageUri(src: unknown): string | null {
  if (typeof src !== "string" || !src.trim()) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("file://")) return src;
  return `${APP_PUBLIC_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

function pickText(content: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const v = content[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

type Props = {
  card: EditorCard;
  businessLocked?: boolean;
};

export function CardPreview({ card, businessLocked }: Props) {
  const locked = businessLocked ?? isBusinessOnlyCard(card.type);
  const content = card.content;
  const title = pickText(content, ["title", "heading", "label", "ctaLabel"]);
  const body = pickText(content, ["body", "subtitle", "description", "text", "content"]);
  const imageUri = resolveImageUri(content.image ?? content.src ?? content.url);

  return (
    <View style={[styles.wrap, locked && styles.locked]}>
      <View style={styles.header}>
        <Text style={styles.type}>{cardTypeLabel(card.type)}</Text>
        {locked ? <Text style={styles.badge}>閲覧のみ</Text> : null}
      </View>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
      ) : null}
      {title ? <Text style={styles.title} numberOfLines={2}>{title}</Text> : null}
      {body ? <Text style={styles.body} numberOfLines={3}>{body}</Text> : null}
      {!title && !body && !imageUri ? (
        <Text style={styles.placeholder}>タップして Web エディタで編集</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  locked: { opacity: 0.92, borderColor: colors.frost },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  type: { fontSize: 12, fontWeight: "700", color: colors.accentDeep },
  badge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6d28d9",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  image: { width: "100%", height: 100, borderRadius: radius.sm, backgroundColor: colors.frost },
  title: { fontSize: 15, fontWeight: "600", color: colors.ink },
  body: { fontSize: 13, color: colors.inkMuted, lineHeight: 18 },
  placeholder: { fontSize: 13, color: colors.inkFaint, fontStyle: "italic" },
});
