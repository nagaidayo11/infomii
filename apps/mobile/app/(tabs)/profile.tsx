import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { fetchMyDraftItineraries } from "@/lib/informations-api";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
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
  const { user, enabled, signOut } = useAuth();
  const { savedIds } = useSaved();
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    if (!user || !hasSupabaseEnv) return;
    void fetchMyDraftItineraries().then((rows) => setDraftCount(rows.length));
  }, [user]);

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Text style={styles.hero}>Profile</Text>
      <Text style={styles.sub}>Minimal. Calm. Yours.</Text>

      <View style={styles.avatar}>
        <Ionicons name="person-outline" size={32} color={colors.accentDeep} />
      </View>
      <Text style={styles.name}>{user?.email?.split("@")[0] ?? "Guest"}</Text>
      <Text style={styles.email}>
        {user?.email ?? (enabled ? "ログインで Web と同期" : "ローカルモード（サンプル閲覧）")}
      </Text>

      {!user ? (
        <Pressable style={styles.loginBtn} onPress={() => router.push("/auth")}>
          <Text style={styles.loginBtnText}>ログイン / 新規登録</Text>
        </Pressable>
      ) : null}

      <View style={styles.card}>
        <ProfileRow icon="bookmark-outline" label="Saved itineraries" value={`${savedIds.length}`} onPress={() => router.push("/saved")} />
        <ProfileRow
          icon="document-text-outline"
          label="My drafts (Supabase)"
          value={user ? `${draftCount}` : "—"}
        />
        <ProfileRow icon="sparkles-outline" label="Premium" value="Explore themes" />
        <ProfileRow icon="share-outline" label="Shared journeys" value="Coming soon" />
      </View>

      <View style={styles.premiumBanner}>
        <Text style={styles.premiumTitle}>More beautiful. More calm.</Text>
        <Text style={styles.premiumBody}>
          広告なし。プレミアムテンプレート・オフライン・高級 QR スタイルなど、ライフスタイル向けの拡張のみ。
        </Text>
      </View>

      {user ? (
        <Pressable style={styles.signOut} onPress={() => signOut()}>
          <Text style={styles.signOutText}>ログアウト</Text>
        </Pressable>
      ) : (
        <Text style={styles.guestNote}>
          ログインなしでもサンプルしおりは閲覧できます。保存・作成の同期にはログインが必要です。
        </Text>
      )}
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
  loginBtn: {
    backgroundColor: colors.accentDeep,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  loginBtnText: { color: "#fff", fontWeight: "600" },
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
  guestNote: { ...typography.caption, marginTop: spacing.xl, textAlign: "center", lineHeight: 18 },
});
