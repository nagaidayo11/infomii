"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase-config";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useAuth } from "@/components/auth-provider";
import { FadeIn } from "@/components/motion";

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

  useEffect(() => {
    if (loading || !user) return;
    router.replace(next);
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
        setMessage(error.message);
        setSubmitting(false);
        return;
      }
      setMessage("登録しました。ログインしてダッシュボードへ移動します。");
      setIsSignUp(false);
    } else {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setSubmitting(false);
        return;
      }
      router.replace(next);
    }
    setSubmitting(false);
  }

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">読み込み中...</p>
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
            {isSignUp ? "新規登録" : "ログイン"}
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
            </div>
          </div>

          {message && (
            <p className={`mt-4 text-sm ${message.startsWith("登録しました") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}

          <div className="mt-6 space-y-2">
            <button
              type="submit"
              disabled={submitting || !hasSupabaseEnv}
              className="app-button-native w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "処理中..." : isSignUp ? "登録する" : "ログイン"}
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
              {isSignUp ? "ログイン画面へ" : "新規登録"}
            </button>
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
