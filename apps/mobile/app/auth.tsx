import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "@/components/Screen";
import { signInWithApple } from "@/lib/apple-auth";
import {
  formatAppleAuthError,
  formatEmailAuthError,
  formatGoogleAuthError,
  formatOtpError,
} from "@/lib/auth-errors";
import { ensureUserHotelScopeForOnboarding } from "@/lib/hotel-scope";
import { signInWithGoogleOAuth } from "@/lib/oauth";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { tapLight } from "@/lib/haptics";

type Mode = "password" | "otp" | "signup";

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("password");
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function finishAuth() {
    await ensureUserHotelScopeForOnboarding();
    router.back();
  }

  async function handlePasswordAuth() {
    const client = getSupabaseClient();
    if (!client) {
      setMessage("Supabase が未設定です (.env を確認)");
      return;
    }
    setSubmitting(true);
    setMessage("");
    setSuccessMsg("");

    if (mode === "signup") {
      const { error } = await client.auth.signUp({ email, password });
      if (error) {
        setMessage(formatEmailAuthError(error.message));
      } else {
        setSuccessMsg("登録しました。確認メールのあとログインしてください。");
        setMode("password");
      }
    } else {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(formatEmailAuthError(error.message));
      } else {
        await finishAuth();
      }
    }
    setSubmitting(false);
  }

  async function handleMagicLink() {
    const client = getSupabaseClient();
    if (!client) {
      setMessage("Supabase が未設定です");
      return;
    }
    setSubmitting(true);
    setMessage("");
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      setMessage(formatOtpError(error.message));
    } else {
      setSuccessMsg("マジックリンクを送信しました。メールをご確認ください。");
    }
    setSubmitting(false);
  }

  async function handleGoogle() {
    setSubmitting(true);
    setMessage("");
    const { error } = await signInWithGoogleOAuth();
    if (error) {
      setMessage(formatGoogleAuthError(error));
    } else {
      await finishAuth();
    }
    setSubmitting(false);
  }

  async function handleApple() {
    setSubmitting(true);
    setMessage("");
    const { error } = await signInWithApple();
    if (error) {
      setMessage(formatAppleAuthError(error));
    } else {
      await finishAuth();
    }
    setSubmitting(false);
  }

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <Pressable style={styles.close} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.inkMuted} />
        </Pressable>

        <Text style={styles.hero}>Infomii</Text>
        <Text style={styles.sub}>Web と同じアカウントで、しおりを同期。</Text>

        {!hasSupabaseEnv ? (
          <View style={styles.warn}>
            <Text style={styles.warnText}>EXPO_PUBLIC_SUPABASE_URL / ANON_KEY を設定してください。</Text>
          </View>
        ) : null}

        {message ? <Text style={styles.error}>{message}</Text> : null}
        {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}

        <View style={styles.card}>
          <View style={styles.tabs}>
            {(["password", "otp", "signup"] as Mode[]).map((m) => (
              <Pressable
                key={m}
                style={[styles.tab, mode === m && styles.tabActive]}
                onPress={() => {
                  void tapLight();
                  setMode(m);
                }}
              >
                <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                  {m === "password" ? "メール" : m === "otp" ? "リンク" : "登録"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>メールアドレス</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={colors.inkFaint}
          />

          {mode !== "otp" ? (
            <>
              <Text style={styles.label}>パスワード</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="6文字以上"
                placeholderTextColor={colors.inkFaint}
              />
            </>
          ) : null}

          <Pressable
            style={[styles.primary, submitting && styles.disabled]}
            disabled={submitting}
            onPress={() => {
              void tapLight();
              if (mode === "otp") void handleMagicLink();
              else void handlePasswordAuth();
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>
                {mode === "otp" ? "マジックリンクを送る" : mode === "signup" ? "新規登録" : "ログイン"}
              </Text>
            )}
          </Pressable>
        </View>

        <Pressable style={styles.oauthBtn} onPress={() => void handleGoogle()} disabled={submitting}>
          <Ionicons name="logo-google" size={18} color={colors.ink} />
          <Text style={styles.oauthText}>Google で続ける（Web と同じ）</Text>
        </Pressable>

        {Platform.OS === "ios" ? (
          <Pressable style={styles.oauthBtn} onPress={() => void handleApple()} disabled={submitting}>
            <Ionicons name="logo-apple" size={18} color={colors.ink} />
            <Text style={styles.oauthText}>Apple で続ける</Text>
          </Pressable>
        ) : null}

        <Text style={styles.footer}>ログインせずにサンプルしおりはそのまま閲覧できます。</Text>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingTop: spacing.md },
  close: { alignSelf: "flex-end", padding: spacing.sm },
  hero: typography.hero,
  sub: { ...typography.body, marginBottom: spacing.xl },
  warn: {
    backgroundColor: colors.aqua,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  warnText: { fontSize: 13, color: colors.ink },
  error: { color: colors.danger, marginBottom: spacing.sm, fontSize: 14 },
  success: { color: colors.accentDeep, marginBottom: spacing.sm, fontSize: 14 },
  card: {
    backgroundColor: colors.cardSolid,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.lg,
  },
  tabs: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    alignItems: "center",
  },
  tabActive: { backgroundColor: colors.aqua },
  tabText: { fontSize: 12, fontWeight: "600", color: colors.inkFaint },
  tabTextActive: { color: colors.ink },
  label: { ...typography.label, marginBottom: spacing.xs, textTransform: "none", fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colors.frost,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.warmWhite,
  },
  primary: {
    backgroundColor: colors.accentDeep,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  disabled: { opacity: 0.6 },
  oauthBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.cardSolid,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.md,
  },
  oauthText: { fontWeight: "600", color: colors.ink },
  footer: { ...typography.caption, textAlign: "center", marginTop: spacing.lg, lineHeight: 18 },
});
