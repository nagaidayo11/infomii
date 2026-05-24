import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ExploreSwipeDeck } from "@/components/ExploreSwipeDeck";
import { Screen } from "@/components/Screen";
import { ShareSheet } from "@/components/ShareSheet";
import { useExploreFeed } from "@/hooks/use-itinerary-feed";
import { useShareSheet } from "@/hooks/use-share-sheet";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { useSaved } from "@/stores/saved-store";

const TAB_BAR_SPACE = 100;

type ExploreHeaderProps = {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  isSearch: boolean;
  usingSamples: boolean;
};

function ExploreHeader({ searchQuery, onSearchChange, isSearch, usingSamples }: ExploreHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>探す</Text>
      <Text style={styles.subtitle}>
        {isSearch
          ? "キーワードに合うしおりをランダム表示"
          : "カードをスワイプして、次のしおりへ"}
      </Text>
      <TextInput
        style={styles.search}
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="京都、ライブ、カフェ…"
        placeholderTextColor={colors.inkFaint}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {usingSamples && !isSearch ? (
        <Text style={styles.sampleNote}>
          公開しおりがまだないため、サンプルをランダム表示しています。
        </Text>
      ) : null}
    </View>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const { isSaved, toggleSave } = useSaved();
  const [searchQuery, setSearchQuery] = useState("");
  const { items, loading, reshuffle, isSearch, usingSamples } = useExploreFeed(searchQuery);
  const { shareItem, shareVisible, openShare, closeShare } = useShareSheet();

  return (
    <Screen scroll={false} bottomInset={TAB_BAR_SPACE} padded={false}>
      <ExploreHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearch={isSearch}
        usingSamples={usingSamples}
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.accentDeep} />
      ) : null}

      {items.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {isSearch ? "該当するしおりがありません" : "まだ公開されたしおりがありません"}
          </Text>
          <Text style={styles.emptyBody}>
            {isSearch
              ? "別のキーワードを試すか、キーワードを空にしてランダム表示。"
              : "作るタブから公開すると、ここに流れます。"}
          </Text>
        </View>
      ) : (
        <View style={styles.deckArea}>
          <ExploreSwipeDeck
            items={items}
            isSaved={isSaved}
            onOpen={(id) => router.push(`/itinerary/${id}`)}
            onToggleSave={(item) => void toggleSave(item)}
            onShare={openShare}
            onDeckEnd={reshuffle}
          />
        </View>
      )}

      <ShareSheet visible={shareVisible} item={shareItem} onClose={closeShare} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  title: typography.hero,
  subtitle: typography.body,
  search: {
    borderWidth: 1,
    borderColor: colors.frost,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.cardSolid,
  },
  sampleNote: {
    fontSize: 12,
    color: colors.inkFaint,
    lineHeight: 18,
  },
  loader: { marginVertical: spacing.md },
  deckArea: {
    flex: 1,
    minHeight: 320,
  },
  empty: {
    flex: 1,
    padding: spacing.xxxl,
    gap: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { ...typography.subtitle, textAlign: "center" },
  emptyBody: { ...typography.body, textAlign: "center" },
});
