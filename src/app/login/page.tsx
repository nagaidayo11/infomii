"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase-config";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useAuth } from "@/components/auth-provider";
import { redeemHotelInvite } from "@/lib/storage";
import { formatHotelInviteRedeemError } from "@/lib/invite-redeem-errors";
import {
  readPendingInviteCode,
  writePendingInviteCode,
  clearPendingInviteCode,
  setDashboardInviteErrorFlash,
  setDashboardInviteSuccessFlash,
  INVITE_REDEEM_LOCK_KEY,
} from "@/lib/invite-pending";
import { FadeIn } from "@/components/motion";

function isEmailCollisionMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("email exists") ||
    normalized.includes("email address is already in use") ||
    normalized.includes("identity already exists")
  );
}

function formatEmailAuthError(message: string): string {
  if (isEmailCollisionMessage(message)) {
    return "このメールアドレスは既に使用されています。メールでログインしてください。";
  }
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません。";
  }
  if (normalized.includes("email not confirmed")) {
    return "メール確認が完了していません。受信メールをご確認ください。";
  }
  return "ログインに失敗しました。時間をおいて再度お試しください。";
}

function formatGoogleAuthError(message: string): string {
  if (isEmailCollisionMessage(message)) {
    return "同じメールアドレスのアカウントが既にあります。先にメールでログインしてからGoogle連携を行ってください。";
  }
  const normalized = message.toLowerCase();
  if (normalized.includes("provider is not enabled")) {
    return "Googleログインの設定が未完了です。管理者にお問い合わせください。";
  }
  if (normalized.includes("access_denied")) {
    return "Googleログインがキャンセルされました。もう一度お試しください。";
  }
  return "Googleログインに失敗しました。時間をおいて再度お試しください。";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const next = searchParams.get("next") && searchParams.get("next")?.startsWith("/")
    ? searchParams.get("next")!
    : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [inviteInput, setInviteInput] = useState("");

  useEffect(() => {
    const stored = readPendingInviteCode();
    if (stored) {
      setInviteInput(stored);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get("invite")?.trim();
    if (!q) return;
    const up = q.toUpperCase();
    writePendingInviteCode(up);
    setInviteInput(up);
    const path =
      next === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(next)}`;
    router.replace(path);
  }, [searchParams, router, next]);

  useEffect(() => {
    const oauthError = searchParams.get("error_description") ?? searchParams.get("error");
    if (!oauthError) return;
    setMessage(formatGoogleAuthError(oauthError));
  }, [searchParams]);

  useEffect(() => {
    if (loading || !user) return;
    if (typeof window === "undefined") return;
    const pending = readPendingInviteCode();
    if (!pending) {
      router.replace(next);
      return;
    }
    if (sessionStorage.getItem(INVITE_REDEEM_LOCK_KEY) === "1") {
      return;
    }
    sessionStorage.setItem(INVITE_REDEEM_LOCK_KEY, "1");
    void (async () => {
      try {
        await redeemHotelInvite(pending);
        clearPendingInviteCode();
        setDashboardInviteSuccessFlash();
        router.replace("/dashboard");
      } catch (e) {
        clearPendingInviteCode();
        setDashboardInviteErrorFlash(formatHotelInviteRedeemError(e));
        router.replace("/dashboard");
      } finally {
        sessionStorage.removeItem(INVITE_REDEEM_LOCK_KEY);
      }
    })();
  }, [loading, user, next, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const client = getBrowserSupabaseClient();
    if (!client) {
      setMessage("Supabase の設定が未完了です。.env.local を確認してください。");
      return;
    }

    setSubmitting(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await client.auth.signUp({ email, password });
      if (error) {
        setMessage(formatEmailAuthError(error.message ?? ""));
        setSubmitting(false);
        return;
      }
      setMessage("登録しました。確認メールをご確認の上、メールアドレスでログインしてください。");
      if (inviteInput.trim()) {
        writePendingInviteCode(inviteInput);
      }
      setIsSignUp(false);
    } else {
      if (inviteInput.trim()) {
        writePendingInviteCode(inviteInput);
      }
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(formatEmailAuthError(error.message ?? ""));
        setSubmitting(false);
        return;
      }
    }
    setSubmitting(false);
  }

  async function handleGoogleLogin() {
    const client = getBrowserSupabaseClient();
    if (!client) {
      setMessage("Supabase の設定が未完了です。.env.local を確認してください。");
      return;
    }

    setSubmitting(true);
    setMessage("");

    if (inviteInput.trim()) {
      writePendingInviteCode(inviteInput);
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectPath = next === "/dashboard" ? "/login" : `/login?next=${encodeURIComponent(next)}`;
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}${redirectPath}` },
    });

    if (error) {
      setMessage(formatGoogleAuthError(error.message ?? ""));
      setSubmitting(false);
      return;
    }
  }

  if (loading || user) {
    const showInvite = typeof window !== "undefined" && user && (Boolean(readPendingInviteCode()) || sessionStorage.getItem(INVITE_REDEEM_LOCK_KEY) === "1");
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">{showInvite ? "招待コードを適用しています…" : "読み込み中..."}</p>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 px-4 py-12"
      style={{
        paddingBottom: "max(3rem, env(safe-area-inset-bottom))",
        paddingTop: "max(3rem, env(safe-area-inset-top))",
      }}
    >
      <FadeIn className="w-full max-w-sm">
        {/* Logo / タイトル */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="text-xl font-semibold text-slate-900">Infomii</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">
            案内を1つ作って、QRで届ける
          </p>
        </div>

        {/* Supabase 未設定時 */}
        {!hasSupabaseEnv && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Supabase の設定が必要です</p>
            <p className="mt-1 text-amber-800">
              <code className="rounded bg-amber-100 px-1">.env.local</code> に
              NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。
            </p>
            <p className="mt-2 text-xs text-amber-800">
              手順はリポジトリの <code className="rounded bg-amber-100 px-1">docs/SETUP.md</code> を参照してください。
            </p>
          </div>
        )}

        {/* フォーム */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-lg font-semibold text-slate-900">
            {isSignUp ? "メールアドレスで新規登録" : "メールアドレスでログイン"}
          </h1>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="6文字以上"
              />
              {!isSignUp && (
                <div className="mt-2 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-slate-600 underline underline-offset-2 hover:text-slate-800"
                  >
                    パスワードをお忘れですか？
                  </Link>
                </div>
              )}
            </div>
          </div>

          {message && (
            <p className={`mt-4 text-sm ${message.startsWith("登録しました") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <h2 className="text-sm font-medium text-slate-800">招待コードで参加</h2>
            <p className="mt-1 text-xs text-slate-500">オーナーから共有された場合のみ入力し、ログインします。</p>
            <input
              type="text"
              name="hotel-invite"
              value={inviteInput}
              onChange={(ev) => {
                const v = ev.target.value.toUpperCase();
                setInviteInput(v);
                if (v.trim()) {
                  writePendingInviteCode(v);
                } else {
                  clearPendingInviteCode();
                }
              }}
              maxLength={20}
              autoComplete="off"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono uppercase tracking-wide placeholder:font-sans placeholder:normal-case"
              placeholder="例: ABCD1234"
            />
          </div>

          <div className="mt-6 space-y-2">
            <button
              type="submit"
              disabled={submitting || !hasSupabaseEnv}
              className="app-button-native w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "処理中..." : isSignUp ? "メールで登録する" : "メールでログイン"}
            </button>
            <div className="relative py-1">
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" />
              <span className="relative mx-auto block w-fit bg-white px-2 text-xs text-slate-400">または</span>
            </div>
            <button
              type="button"
              onClick={() => void handleGoogleLogin()}
              aria-label="Googleでログイン"
              disabled={submitting || !hasSupabaseEnv}
              className="app-button-native flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-[14px] font-medium text-[#3c4043] shadow-sm transition hover:bg-[#f8f9fa] active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]/30 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "#ffffff", borderColor: "#dadce0" }}
            >
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2582h2.9086c1.7018-1.5668 2.6837-3.8741 2.6837-6.6155z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.4673-.8068 5.9564-2.1791l-2.9086-2.2582c-.8068.5409-1.8409.8591-3.0478.8591-2.3441 0-4.3282-1.5832-5.0364-3.7105H.9573v2.3318C2.4382 15.9845 5.4818 18 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.9636 10.7113c-.18-.5409-.2836-1.1186-.2836-1.7113s.1036-1.1705.2836-1.7113V4.9568H.9573C.3477 6.1718 0 7.5445 0 9s.3477 2.8282.9573 4.0432l3.0063-2.3319z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.5782c1.3214 0 2.5077.4541 3.4405 1.3459l2.5813-2.5813C13.4632.8918 11.4268 0 9 0 5.4818 0 2.4382 2.0155.9573 4.9568l3.0063 2.3319C4.6718 5.1614 6.6559 3.5782 9 3.5782z"
                />
              </svg>
              Googleでログイン
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp((v) => !v);
                setMessage("");
              }}
              disabled={submitting}
              className="app-button-native w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {isSignUp ? "ログイン画面へ" : "新規登録（メールアドレス）"}
            </button>
            <p className="pt-1 text-center text-xs text-slate-500">
              新規登録はメールアドレスで行います。Googleはログイン専用です。
            </p>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          公開ページはログイン不要です。
          <Link href="/" className="ml-1 text-slate-600 underline hover:text-slate-800">
            トップへ
          </Link>
        </p>
      </FadeIn>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">読み込み中...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
