import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import type { ItineraryBlock } from "@/types/itinerary";

type Props = {
  blocks: ItineraryBlock[];
};

export function TimelineView({ blocks }: Props) {
  return (
    <View style={styles.wrap}>
      {blocks.map((block) => (
        <View key={block.id} style={styles.block}>
          {block.type === "schedule" && block.scheduleItems ? (
            <>
              <Text style={styles.blockTitle}>{block.title}</Text>
              {block.scheduleItems.map((item, i) => (
                <View key={`${item.day}-${item.time}-${i}`} style={styles.scheduleRow}>
                  <View style={styles.timeCol}>
                    <Text style={styles.day}>{item.day || " "}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                  </View>
                  <View style={styles.lineCol}>
                    <View style={styles.dot} />
                    {i < block.scheduleItems!.length - 1 ? <View style={styles.line} /> : null}
                  </View>
                  <Text style={styles.label}>{item.label}</Text>
                </View>
              ))}
            </>
          ) : null}

          {block.type === "checklist" && block.checklistItems ? (
            <>
              <Text style={styles.blockTitle}>{block.title}</Text>
              {block.checklistItems.map((item) => (
                <View key={item} style={styles.checkItem}>
                  <View style={styles.checkBox} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </>
          ) : null}

          {block.type === "steps" && block.steps ? (
            <>
              <Text style={styles.blockTitle}>{block.title}</Text>
              {block.steps.map((step, i) => (
                <View key={step.title} style={styles.stepItem}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                  <View style={styles.stepBody}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : null}

          {block.type === "nearby" && block.nearby ? (
            <>
              <Text style={styles.blockTitle}>{block.title}</Text>
              {block.nearby.map((place) => (
                <View key={place.name} style={styles.placeItem}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.placeDesc}>{place.description}</Text>
                </View>
              ))}
            </>
          ) : null}

          {(block.type === "map" || block.type === "notice" || block.type === "welcome") && block.body ? (
            <>
              <Text style={styles.blockTitle}>{block.title}</Text>
              <Text style={styles.bodyText}>{block.body}</Text>
            </>
          ) : null}

          {block.type === "hero" ? (
            <View style={styles.heroBlock}>
              <Text style={styles.heroTitle}>{block.title}</Text>
              {block.subtitle ? <Text style={styles.heroSub}>{block.subtitle}</Text> : null}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xl },
  block: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  blockTitle: typography.subtitle,
  scheduleRow: {
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 52,
  },
  timeCol: { width: 56 },
  day: { ...typography.caption, fontSize: 11 },
  time: { fontSize: 14, fontWeight: "600", color: colors.ink },
  lineCol: { alignItems: "center", width: 12 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.frost,
    marginVertical: 2,
  },
  label: { ...typography.body, flex: 1, color: colors.ink },
  checkItem: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  checkText: typography.body,
  stepItem: { flexDirection: "row", gap: spacing.md },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.aqua,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "700",
    color: colors.ink,
    fontSize: 13,
  },
  stepBody: { flex: 1, gap: 2 },
  stepTitle: { fontSize: 15, fontWeight: "600", color: colors.ink },
  stepDesc: typography.body,
  placeItem: { gap: 2 },
  placeName: { fontSize: 15, fontWeight: "600", color: colors.ink },
  placeDesc: typography.body,
  bodyText: typography.body,
  heroBlock: { gap: spacing.xs },
  heroTitle: { fontSize: 20, fontWeight: "700", color: colors.ink },
  heroSub: typography.body,
});
