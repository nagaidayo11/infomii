import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { fetchMyDraftItineraries } from "@/lib/informations-api";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { APP_PUBLIC_URL } from "@/lib/config";
import { hasSupabaseEnv } from "@/lib/supabase";
import { useAuth } from "@/stores/auth-provider";
import { useSaved } from "@/stores/saved-store";

const TAB_BAR_SPACE = 100;

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
};

function ProfileRow({ icon, label, value, onPress }: RowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <Ionicons name={icon} size={20} color={colors.accentDeep} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} /> : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { savedKeys } = useSaved();
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    if (!user || !hasSupabaseEnv) return;
    void fetchMyDraftItineraries().then((rows) => setDraftCount(rows.length));
  }, [user]);

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Text style={styles.hero}>マイページ</Text>
      <Text style={styles.sub}>シンプルに。静かに。あなたのもの。</Text>

      <View style={styles.avatar}>
        <Ionicons name="person-outline" size={32} color={colors.accentDeep} />
      </View>
      <Text style={styles.name}>{user?.email?.split("@")[0] ?? "ユーザー"}</Text>
      <Text style={styles.email}>{user?.email ?? ""}</Text>

      <View style={styles.card}>
        <ProfileRow icon="bookmark-outline" label="保存したしおり" value={`${savedKeys.length}件`} onPress={() => router.push("/saved")} />
        <ProfileRow
          icon="document-text-outline"
          label="下書き（Supabase）"
          value={user ? `${draftCount}件` : "—"}
        />
        <ProfileRow icon="sparkles-outline" label="プレミアム" value="テーマを見る" />
        <ProfileRow icon="share-outline" label="共有した旅" value="準備中" />
        <ProfileRow
          icon="people-outline"
          label="チーム・招待コード"
          value="Web で管理"
          onPress={() => void WebBrowser.openBrowserAsync(`${APP_PUBLIC_URL}/dashboard/team`)}
        />
      </View>

      <View style={styles.premiumBanner}>
        <Text style={styles.premiumTitle}>もっと美しく。もっと静かに。</Text>
        <Text style={styles.premiumBody}>
          広告なし。プレミアムテンプレート・オフライン・高級 QR スタイルなど、ライフスタイル向けの拡張のみ。
        </Text>
      </View>

      <Pressable style={styles.signOut} onPress={() => void signOut()}>
        <Text style={styles.signOutText}>ログアウト</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: typography.hero,
  sub: { ...typography.body, marginBottom: spacing.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.aqua,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  name: { fontSize: 22, fontWeight: "700", color: colors.ink },
  email: { ...typography.caption, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: colors.ink },
  rowValue: { fontSize: 13, color: colors.inkFaint },
  premiumBanner: {
    backgroundColor: colors.cardSolid,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  premiumTitle: { fontSize: 16, fontWeight: "600", color: colors.ink },
  premiumBody: typography.body,
  signOut: { marginTop: spacing.xl, alignItems: "center", padding: spacing.lg },
  signOutText: { color: colors.danger, fontWeight: "600" },
});
