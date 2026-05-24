import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signInWithApple } from "@/lib/apple-auth";
import {
  formatAppleAuthError,
  formatEmailAuthError,
  formatGoogleAuthError,
  formatOtpError,
} from "@/lib/auth-errors";
import { saveItinerary, targetFromKey } from "@/lib/information-saves-api";
import { ensureUserHotelScopeForOnboarding } from "@/lib/hotel-scope";
import {
  consumePendingPublishAfterAuth,
  consumePendingSave,
  peekPendingPublishAfterAuth,
  peekPendingSave,
} from "@/lib/pending-auth";
import { signInWithGoogleOAuth } from "@/lib/oauth";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { tapLight } from "@/lib/haptics";

type EmailMode = "login" | "signup" | "otp";

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isIos = Platform.OS === "ios";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailMode, setEmailMode] = useState<EmailMode>("login");
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saveIntent, setSaveIntent] = useState(false);
  const [publishIntent, setPublishIntent] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    void (async () => {
      const pendingSave = await peekPendingSave();
      const pendingPublish = await peekPendingPublishAfterAuth();
      setSaveIntent(Boolean(pendingSave));
      setPublishIntent(pendingPublish && !pendingSave);
    })();
  }, []);

  useEffect(() => {
    if (!isIos) return;
    void AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, [isIos]);

  async function finishAuth() {
    await ensureUserHotelScopeForOnboarding();

    const pendingSave = await consumePendingSave();
    if (pendingSave) {
      const target = targetFromKey(pendingSave.saveKey);
      if (target) {
        try {
          await saveItinerary(target);
        } catch {
          /* ignore */
        }
      }
      router.replace(pendingSave.returnPath as never);
      return;
    }

    const pendingPublish = await consumePendingPublishAfterAuth();
    if (pendingPublish) {
      router.replace("/(tabs)/create");
      return;
    }

    router.back();
  }

  async function handleEmailAuth() {
    const client = getSupabaseClient();
    if (!client) {
      setMessage("Supabase が未設定です (.env を確認)");
      return;
    }
    setSubmitting(true);
    setMessage("");
    setSuccessMsg("");

    if (emailMode === "otp") {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) setMessage(formatOtpError(error.message));
      else setSuccessMsg("マジックリンクを送信しました。メールをご確認ください。");
    } else if (emailMode === "signup") {
      const { error } = await client.auth.signUp({ email, password });
      if (error) setMessage(formatEmailAuthError(error.message));
      else {
        setSuccessMsg("登録しました。確認メールのあとログインしてください。");
        setEmailMode("login");
      }
    } else {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) setMessage(formatEmailAuthError(error.message));
      else await finishAuth();
    }
    setSubmitting(false);
  }

  async function handleGoogle() {
    setSubmitting(true);
    setMessage("");
    const { error } = await signInWithGoogleOAuth();
    if (error) setMessage(formatGoogleAuthError(error));
    else await finishAuth();
    setSubmitting(false);
  }

  async function handleApple() {
    setSubmitting(true);
    setMessage("");
    const { error } = await signInWithApple();
    if (error && !error.includes("キャンセル")) {
      setMessage(formatAppleAuthError(error));
    } else if (!error) {
      await finishAuth();
    }
    setSubmitting(false);
  }

  const intentTitle = saveIntent
    ? "保存するにはログイン"
    : publishIntent
      ? "公開するにはログイン"
      : null;
  const intentBody = saveIntent
    ? "ログイン後、このしおりをライブラリに追加します。"
    : publishIntent
      ? "ログイン後、編集中のしおりを同期して公開できます。"
      : null;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.warmWhite, colors.mist, colors.aqua]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxl },
          ]}
        >
          <Pressable style={styles.close} onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.inkMuted} />
          </Pressable>

          {intentTitle ? (
            <View style={styles.intentBanner}>
              <Ionicons
                name={saveIntent ? "bookmark" : "cloud-upload-outline"}
                size={20}
                color={colors.accentDeep}
              />
              <View style={styles.intentTextWrap}>
                <Text style={styles.intentTitle}>{intentTitle}</Text>
                <Text style={styles.intentBody}>{intentBody}</Text>
              </View>
            </View>
          ) : null}

          <Text style={styles.hero}>Infomii</Text>
          <Text style={styles.sub}>かんたんログインで、しおりを保存・公開。</Text>

          {!hasSupabaseEnv ? (
            <View style={styles.warn}>
              <Text style={styles.warnText}>
                EXPO_PUBLIC_SUPABASE_URL / ANON_KEY を設定してください。
              </Text>
            </View>
          ) : null}

          {message ? <Text style={styles.error}>{message}</Text> : null}
          {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}

          {/* メイン: Apple（iOS） */}
          {isIos && appleAvailable ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={14}
              style={styles.applePrimary}
              onPress={() => void handleApple()}
            />
          ) : isIos ? (
            <Pressable
              style={[styles.applePrimaryFallback, submitting && styles.disabled]}
              onPress={() => void handleApple()}
              disabled={submitting}
            >
              <Ionicons name="logo-apple" size={22} color="#fff" />
              <Text style={styles.applePrimaryText}>Apple で続ける</Text>
            </Pressable>
          ) : null}

          {/* Android では Google をメイン */}
          {!isIos ? (
            <Pressable
              style={[styles.googleMain, submitting && styles.disabled]}
              onPress={() => void handleGoogle()}
              disabled={submitting}
            >
              <Ionicons name="logo-google" size={20} color={colors.ink} />
              <Text style={styles.googleMainText}>Google で続ける</Text>
            </Pressable>
          ) : null}

          <View style={styles.secondaryBlock}>
            <Text style={styles.secondaryLabel}>その他の方法</Text>

            {isIos ? (
              <Pressable
                style={[styles.secondaryBtn, submitting && styles.disabled]}
                onPress={() => void handleGoogle()}
                disabled={submitting}
              >
                <Ionicons name="logo-google" size={16} color={colors.inkMuted} />
                <Text style={styles.secondaryBtnText}>Google で続ける</Text>
              </Pressable>
            ) : null}

            <Pressable
              style={styles.secondaryBtn}
              onPress={() => {
                void tapLight();
                setEmailExpanded((v) => !v);
              }}
            >
              <Ionicons name="mail-outline" size={16} color={colors.inkMuted} />
              <Text style={styles.secondaryBtnText}>
                {emailExpanded ? "メールログインを閉じる" : "メールでログイン"}
              </Text>
              <Ionicons
                name={emailExpanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.inkFaint}
              />
            </Pressable>
          </View>

          {emailExpanded ? (
            <View style={styles.emailCard}>
              <View style={styles.emailTabs}>
                <Pressable
                  style={[styles.emailTab, emailMode === "login" && styles.emailTabActive]}
                  onPress={() => setEmailMode("login")}
                >
                  <Text
                    style={[
                      styles.emailTabText,
                      emailMode === "login" && styles.emailTabTextActive,
                    ]}
                  >
                    ログイン
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.emailTab, emailMode === "signup" && styles.emailTabActive]}
                  onPress={() => setEmailMode("signup")}
                >
                  <Text
                    style={[
                      styles.emailTabText,
                      emailMode === "signup" && styles.emailTabTextActive,
                    ]}
                  >
                    新規登録
                  </Text>
                </Pressable>
              </View>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="メールアドレス"
                placeholderTextColor={colors.inkFaint}
              />

              {emailMode !== "otp" ? (
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="パスワード（6文字以上）"
                  placeholderTextColor={colors.inkFaint}
                />
              ) : null}

              <Pressable
                style={[styles.emailSubmit, submitting && styles.disabled]}
                disabled={submitting}
                onPress={() => void handleEmailAuth()}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.emailSubmitText}>
                    {emailMode === "otp"
                      ? "リンクを送る"
                      : emailMode === "signup"
                        ? "登録する"
                        : "ログイン"}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => setEmailMode(emailMode === "otp" ? "login" : "otp")}
              >
                <Text style={styles.emailLink}>
                  {emailMode === "otp" ? "パスワードでログイン" : "マジックリンクでログイン"}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <Pressable style={styles.skipBtn} onPress={() => router.back()}>
            <Text style={styles.skipText}>あとで</Text>
          </Pressable>

          <Text style={styles.footerNote}>Web 版と同じアカウント（Google・メール）でも同期できます。</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.warmWhite },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    width: "100%",
  },
  close: { alignSelf: "flex-end", padding: spacing.sm, marginBottom: spacing.sm },
  intentBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: "rgba(90, 155, 176, 0.15)",
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(90, 155, 176, 0.3)",
  },
  intentTextWrap: { flex: 1, gap: spacing.xs },
  intentTitle: { fontSize: 16, fontWeight: "700", color: colors.ink },
  intentBody: { fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  hero: { ...typography.hero, marginBottom: spacing.xs },
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
  applePrimary: {
    width: "100%",
    height: 52,
    marginBottom: spacing.xl,
  },
  applePrimaryFallback: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    width: "100%",
    height: 52,
    borderRadius: 14,
    backgroundColor: "#000",
    marginBottom: spacing.xl,
  },
  applePrimaryText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  googleMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    width: "100%",
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.cardSolid,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.xl,
  },
  googleMainText: { fontSize: 17, fontWeight: "600", color: colors.ink },
  secondaryBlock: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  secondaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.inkFaint,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.inkMuted,
    flex: 1,
    textAlign: "center",
  },
  emailCard: {
    backgroundColor: colors.cardSolid,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  emailTabs: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  emailTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    alignItems: "center",
  },
  emailTabActive: { backgroundColor: colors.aqua },
  emailTabText: { fontSize: 13, fontWeight: "600", color: colors.inkFaint },
  emailTabTextActive: { color: colors.ink },
  input: {
    borderWidth: 1,
    borderColor: colors.frost,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.warmWhite,
    minHeight: 44,
  },
  emailSubmit: {
    backgroundColor: colors.accentDeep,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.xs,
    minHeight: 44,
    justifyContent: "center",
  },
  emailSubmitText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  emailLink: {
    fontSize: 13,
    color: colors.accentDeep,
    textAlign: "center",
    marginTop: spacing.sm,
    fontWeight: "500",
  },
  skipBtn: { alignItems: "center", paddingVertical: spacing.md },
  skipText: { fontSize: 15, fontWeight: "600", color: colors.inkMuted },
  footerNote: {
    ...typography.caption,
    textAlign: "center",
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  disabled: { opacity: 0.55 },
});
