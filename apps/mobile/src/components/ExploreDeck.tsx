import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { getCategoryLabel } from "@/data/sample-itineraries";
import { selection, tapSoft } from "@/lib/haptics";
import type { ItineraryCard } from "@/types/itinerary";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - spacing.screen * 2;
const CARD_HEIGHT = CARD_WIDTH * 1.25;

type Props = {
  items: ItineraryCard[];
  savedIds: string[];
  onOpen: (id: string) => void;
  onToggleSave: (id: string) => void;
  onShare?: (item: ItineraryCard) => void;
};

function DeckCard({
  item,
  saved,
  onOpen,
  onToggleSave,
  onShare,
}: {
  item: ItineraryCard;
  saved: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
  onShare?: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.cardWrap, animatedStyle]}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 18, stiffness: 220 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 220 });
        }}
        onPress={() => {
          void tapSoft();
          onOpen();
        }}
        style={styles.card}
      >
        <Image source={{ uri: item.coverImage }} style={styles.image} contentFit="cover" transition={400} />
        <View style={styles.gradient} />
        <View style={styles.body}>
          <Text style={styles.category}>{getCategoryLabel(item.category)}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.meta}>
            {item.location} · {item.duration} · {item.stops} spots
          </Text>
          <View style={styles.actions}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                void selection();
                onToggleSave();
              }}
            >
              <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={20} color={colors.ink} />
              <Text style={styles.actionLabel}>{saved ? "Saved" : "Save"}</Text>
            </Pressable>
            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                void selection();
                onShare?.();
              }}
            >
              <Ionicons name="qr-code-outline" size={20} color={colors.ink} />
              <Text style={styles.actionLabel}>Share</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ExploreDeck({ items, savedIds, onOpen, onToggleSave, onShare }: Props) {
  const [index, setIndex] = useState(0);
  const lastIndex = useRef(0);

  const onScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + spacing.md));
    if (next !== lastIndex.current) {
      lastIndex.current = next;
      setIndex(next);
      void selection();
    }
  }, []);

  return (
    <View style={styles.wrap}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        snapToInterval={CARD_WIDTH + spacing.md}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <DeckCard
            item={item}
            saved={savedIds.includes(item.id)}
            onOpen={() => onOpen(item.id)}
            onToggleSave={() => onToggleSave(item.id)}
            onShare={onShare ? () => onShare(item) : undefined}
          />
        )}
      />
      <View style={styles.dots}>
        {items.map((item, i) => (
          <View key={item.id} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <Text style={styles.hint}>Swipe to discover · {index + 1} / {items.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.lg },
  list: {
    paddingHorizontal: spacing.screen,
    gap: spacing.md,
  },
  cardWrap: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
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
    backgroundColor: "rgba(26, 43, 51, 0.42)",
  },
  body: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  category: { ...typography.label, color: "rgba(255,255,255,0.9)" },
  title: {
    fontSize: 28,
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
    marginTop: spacing.lg,
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
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.frost,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.accentDeep,
  },
  hint: {
    ...typography.caption,
    textAlign: "center",
  },
});
