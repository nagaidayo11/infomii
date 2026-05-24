import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { getCategoryLabel } from "@/data/sample-itineraries";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { selection, tapSoft } from "@/lib/haptics";
import type { ItineraryCard } from "@/types/itinerary";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - spacing.screen * 2;
const CARD_HEIGHT = Math.min(CARD_WIDTH * 1.22, SCREEN_HEIGHT * 0.52);
const SWIPE_THRESHOLD = CARD_WIDTH * 0.28;
const ROTATION_DEG = 12;

type Props = {
  items: ItineraryCard[];
  isSaved: (item: ItineraryCard) => boolean;
  onOpen: (id: string) => void;
  onToggleSave: (item: ItineraryCard) => void;
  onShare?: (item: ItineraryCard) => void;
  onDeckEnd?: () => void;
};

function SwipeCard({
  item,
  saved,
  isTop,
  translateX,
  translateY,
  onOpen,
  onToggleSave,
  onShare,
}: {
  item: ItineraryCard;
  saved: boolean;
  isTop: boolean;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  onOpen: () => void;
  onToggleSave: () => void;
  onShare?: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    if (!isTop) {
      const scale = 0.96;
      return {
        transform: [{ scale }],
        opacity: 0.92,
      };
    }
    const rotate = (translateX.value / CARD_WIDTH) * ROTATION_DEG;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(translateX.value / SWIPE_THRESHOLD, 1),
  }));

  const skipOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(-translateX.value / SWIPE_THRESHOLD, 1),
  }));

  return (
    <Animated.View
      style={[styles.cardWrap, isTop ? styles.cardTop : styles.cardBehind, animatedStyle]}
      pointerEvents={isTop ? "auto" : "none"}
    >
      {isTop ? (
        <>
          <Animated.View style={[styles.stamp, styles.stampLike, likeOpacity]}>
            <Text style={styles.stampLikeText}>保存</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.stampSkip, skipOpacity]}>
            <Text style={styles.stampSkipText}>スキップ</Text>
          </Animated.View>
        </>
      ) : null}

      <Pressable
        style={styles.card}
        onPress={() => {
          if (!isTop) return;
          void tapSoft();
          onOpen();
        }}
      >
        <Image source={{ uri: item.coverImage }} style={styles.image} contentFit="cover" transition={400} />
        <View style={styles.gradient} />
        <View style={styles.body}>
          <Text style={styles.category}>{getCategoryLabel(item.category)}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
          <Text style={styles.meta}>
            {item.location} · {item.duration} · {item.stops} スポット
          </Text>
          {isTop ? (
            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => {
                  void selection();
                  onToggleSave();
                }}
              >
                <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color={colors.ink} />
                <Text style={styles.actionLabel}>{saved ? "保存済み" : "保存"}</Text>
              </Pressable>
              {onShare ? (
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => {
                    void selection();
                    onShare();
                  }}
                >
                  <Ionicons name="qr-code-outline" size={20} color={colors.ink} />
                  <Text style={styles.actionLabel}>共有</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ExploreSwipeDeck({
  items,
  isSaved,
  onOpen,
  onToggleSave,
  onShare,
  onDeckEnd,
}: Props) {
  const [index, setIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    setIndex(0);
    translateX.value = 0;
    translateY.value = 0;
  }, [items, translateX, translateY]);

  const advance = useCallback(
    (direction: "left" | "right") => {
      const current = items[index];
      if (!current) return;

      if (direction === "right") {
        onToggleSave(current);
      }

      void selection();
      const next = index + 1;
      if (next >= items.length) {
        onDeckEnd?.();
        setIndex(0);
      } else {
        setIndex(next);
      }
      translateX.value = 0;
      translateY.value = 0;
    },
    [index, items, onDeckEnd, onToggleSave, translateX, translateY],
  );

  const flyOff = useCallback(
    (direction: "left" | "right") => {
      const toX = direction === "right" ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;
      translateX.value = withTiming(toX, { duration: 220 }, () => {
        runOnJS(advance)(direction);
      });
    },
    [advance, translateX],
  );

  const pan = Gesture.Pan()
    .enabled(index < items.length)
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.15;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        runOnJS(flyOff)("right");
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        runOnJS(flyOff)("left");
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const current = items[index];
  const next = items[index + 1];
  if (!current) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.stack}>
        {next ? (
          <SwipeCard
            key={`${next.id}-back`}
            item={next}
            saved={isSaved(next)}
            isTop={false}
            translateX={translateX}
            translateY={translateY}
            onOpen={() => onOpen(next.id)}
            onToggleSave={() => onToggleSave(next)}
          />
        ) : null}
        <GestureDetector gesture={pan}>
          <SwipeCard
            key={`${current.id}-top`}
            item={current}
            saved={isSaved(current)}
            isTop
            translateX={translateX}
            translateY={translateY}
            onOpen={() => onOpen(current.id)}
            onToggleSave={() => onToggleSave(current)}
            onShare={onShare ? () => onShare(current) : undefined}
          />
        </GestureDetector>
      </View>

      <View style={styles.controls}>
        <Pressable
          style={[styles.circleBtn, styles.skipBtn]}
          onPress={() => flyOff("left")}
          accessibilityLabel="スキップ"
        >
          <Ionicons name="close" size={28} color={colors.inkMuted} />
        </Pressable>
        <Pressable
          style={[styles.circleBtn, styles.saveBtn]}
          onPress={() => flyOff("right")}
          accessibilityLabel="保存"
        >
          <Ionicons name="bookmark" size={26} color="#fff" />
        </Pressable>
      </View>

      <Text style={styles.hint}>
        右スワイプで保存 · 左で次へ · {index + 1} / {items.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.screen,
  },
  stack: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrap: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardTop: { zIndex: 2 },
  cardBehind: { zIndex: 1, top: 8 },
  card: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: colors.cardSolid,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  image: { ...StyleSheet.absoluteFillObject },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 43, 51, 0.45)",
  },
  body: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.xl,
    gap: spacing.xs,
  },
  category: { ...typography.label, color: "rgba(255,255,255,0.9)" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 22,
  },
  meta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  stamp: {
    position: "absolute",
    top: spacing.xl,
    zIndex: 10,
    borderWidth: 3,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stampLike: {
    left: spacing.lg,
    borderColor: colors.accentDeep,
    transform: [{ rotate: "-12deg" }],
  },
  stampLikeText: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.accentDeep,
  },
  stampSkip: {
    right: spacing.lg,
    borderColor: colors.inkFaint,
    transform: [{ rotate: "12deg" }],
  },
  stampSkipText: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.inkFaint,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxxl,
    marginTop: spacing.md,
  },
  circleBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  skipBtn: {
    backgroundColor: colors.cardSolid,
    borderWidth: 1,
    borderColor: colors.frost,
  },
  saveBtn: {
    backgroundColor: colors.accentDeep,
  },
  hint: {
    ...typography.caption,
    textAlign: "center",
  },
});
