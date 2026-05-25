import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import {
  readPendingInviteCode,
  setOnboardingScopeBootstrap,
  writePendingInviteCode,
} from "@/lib/invite-pending";
import { completeAfterLogin } from "@/lib/post-auth";
import { getAuthRedirectUri, signInWithGoogleOAuth } from "@/lib/oauth";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { colors } from "@/design/colors";
import { radius, spacing } from "@/design/spacing";
import { typography } from "@/design/typography";
import { tapLight } from "@/lib/haptics";

type EmailMode = "login" | "signup" | "otp";

export default function AuthScreen() {
  const router = useRouter();
  const { invite: inviteParam } = useLocalSearchParams<{ invite?: string }>();
  const insets = useSafeAreaInsets();
  const isIos = Platform.OS === "ios";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailMode, setEmailMode] = useState<EmailMode>("login");
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [inviteInput, setInviteInput] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    void (async () => {
      const stored = await readPendingInviteCode();
      if (stored) {
        setInviteInput(stored);
        setInviteOpen(true);
      }
    })();
  }, []);

  useEffect(() => {
    const q = inviteParam?.trim();
    if (!q) return;
    const up = q.toUpperCase();
    void writePendingInviteCode(up);
    setInviteInput(up);
    setInviteOpen(true);
  }, [inviteParam]);

  useEffect(() => {
    if (!isIos) return;
    void AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, [isIos]);

  async function persistInviteBeforeAuth() {
    if (inviteInput.trim()) {
      await writePendingInviteCode(inviteInput);
    }
  }

  async function finishAuth() {
    await completeAfterLogin(router);
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
      await persistInviteBeforeAuth();
      const { error } = await client.auth.signUp({ email, password });
      if (error) setMessage(formatEmailAuthError(error.message));
      else {
        await setOnboardingScopeBootstrap();
        setSuccessMsg("登録しました。確認メールのあとログインしてください。");
        setEmailMode("login");
      }
    } else {
      await persistInviteBeforeAuth();
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) setMessage(formatEmailAuthError(error.message));
      else await finishAuth();
    }
    setSubmitting(false);
  }

  async function handleGoogle() {
    setSubmitting(true);
    setMessage("");
    await persistInviteBeforeAuth();
    const { error } = await signInWithGoogleOAuth();
    if (error) setMessage(formatGoogleAuthError(error));
    else await finishAuth();
    setSubmitting(false);
  }

  async function handleApple() {
    setSubmitting(true);
    setMessage("");
    await persistInviteBeforeAuth();
    const { error } = await signInWithApple();
    if (error && !error.includes("キャンセル")) {
      setMessage(formatAppleAuthError(error));
    } else if (!error) {
      await finishAuth();
    }
    setSubmitting(false);
  }

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
          <Text style={styles.hero}>Infomii</Text>
          <Text style={styles.sub}>ログインして、しおりの作成・保存・公開を始めましょう。</Text>

          {!hasSupabaseEnv ? (
            <View style={styles.warn}>
              <Text style={styles.warnText}>
                EXPO_PUBLIC_SUPABASE_URL / ANON_KEY を設定してください。
              </Text>
            </View>
          ) : null}

          {message ? <Text style={styles.error}>{message}</Text> : null}
          {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}

          {hasSupabaseEnv ? (
            <Text style={styles.redirectHint} selectable>
              Supabase → Redirect URLs（いずれか必須）:{"\n"}
              {getAuthRedirectUri()}
              {"\n"}
              または https://infomii.com/auth/mobile-callback
            </Text>
          ) : null}

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

          <View style={styles.inviteBlock}>
            <Pressable
              style={styles.inviteToggle}
              onPress={() => {
                void tapLight();
                setInviteOpen((v) => !v);
              }}
            >
              <Ionicons name="people-outline" size={18} color={colors.accentDeep} />
              <Text style={styles.inviteToggleText}>
                {inviteOpen ? "招待コードを閉じる" : "チーム招待コードがある"}
              </Text>
              <Ionicons
                name={inviteOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.inkFaint}
              />
            </Pressable>
            {inviteOpen ? (
              <TextInput
                style={[styles.input, styles.inviteInput]}
                value={inviteInput}
                onChangeText={setInviteInput}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="招待コード（例: ABCD1234）"
                placeholderTextColor={colors.inkFaint}
              />
            ) : null}
            {inviteOpen ? (
              <Text style={styles.inviteHint}>
                ログイン後に自動でチームに参加します。Web 版と同じコードが使えます。
              </Text>
            ) : null}
          </View>

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

          <Text style={styles.footerNote}>
            Web 版と同じアカウント（Apple・Google・メール）でデータを同期できます。
          </Text>
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
  inviteBlock: {
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    width: "100%",
  },
  inviteToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignSelf: "center",
  },
  inviteToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
    textAlign: "center",
  },
  inviteInput: {
    alignSelf: "stretch",
  },
  inviteHint: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkFaint,
    textAlign: "center",
    paddingHorizontal: spacing.md,
    alignSelf: "stretch",
  },
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
  redirectHint: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.inkFaint,
    marginBottom: spacing.md,
    textAlign: "center",
  },
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
  footerNote: {
    ...typography.caption,
    textAlign: "center",
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  disabled: { opacity: 0.55 },
});
