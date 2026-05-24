import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { getCategoryLabel } from "@/data/sample-itineraries";
import { selection, tapLight } from "@/lib/haptics";
import type { ItineraryCard as ItineraryCardType } from "@/types/itinerary";

type Props = {
  item: ItineraryCardType;
  variant?: "featured" | "compact" | "grid";
  saved?: boolean;
  onPress?: () => void;
  onSave?: () => void;
  onShare?: () => void;
};

export function ItineraryCard({
  item,
  variant = "compact",
  saved = false,
  onPress,
  onSave,
  onShare,
}: Props) {
  const isFeatured = variant === "featured";
  const isGrid = variant === "grid";

  return (
    <Pressable
      onPress={() => {
        void tapLight();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.card,
        isFeatured && styles.featured,
        isGrid && styles.grid,
        pressed && styles.pressed,
      ]}
    >
      <Image source={{ uri: item.coverImage }} style={styles.image} contentFit="cover" transition={300} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.category}>{getCategoryLabel(item.category)}</Text>
        <Text style={[styles.title, isFeatured && styles.titleFeatured]} numberOfLines={2}>
          {item.title}
        </Text>
        {!isGrid ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>
            {item.location} · {item.duration}
          </Text>
          <View style={styles.actions}>
            {onSave ? (
              <Pressable
                hitSlop={10}
                onPress={(e) => {
                  e.stopPropagation?.();
                  void selection();
                  onSave();
                }}
                style={styles.iconBtn}
              >
                <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={18} color="#fff" />
              </Pressable>
            ) : null}
            {onShare ? (
              <Pressable
                hitSlop={10}
                onPress={(e) => {
                  e.stopPropagation?.();
                  void selection();
                  onShare();
                }}
                style={styles.iconBtn}
              >
                <Ionicons name="qr-code-outline" size={18} color="#fff" />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
      {item.premium ? (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumText}>プレミアム</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    height: 320,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.cardSolid,
  },
  featured: {
    width: 300,
    height: 380,
  },
  grid: {
    width: "100%",
    height: 220,
  },
  pressed: { transform: [{ scale: 0.985 }] },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.lg,
    gap: spacing.xs,
  },
  category: {
    ...typography.label,
    color: "rgba(255,255,255,0.85)",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.2,
  },
  titleFeatured: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.88)",
    fontWeight: "400",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  meta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
    flex: 1,
  },
  actions: { flexDirection: "row", gap: spacing.sm },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.premium,
    letterSpacing: 0.4,
  },
});
