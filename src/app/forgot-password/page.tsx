"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { hasSupabaseEnv } from "@/lib/supabase-config";
import { FadeIn } from "@/components/motion";

const COOLDOWN_SECONDS = 60;

function isRateLimitedError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("too many requests") || normalized.includes("rate limit");
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (cooldownSeconds > 0) return;
    const client = getBrowserSupabaseClient();
    if (!client) {
      setMessage("Supabase の設定が未完了です。.env.local を確認してください。");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setSent(false);

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      setMessage(
        isRateLimitedError(error.message ?? "")
          ? "送信回数が上限に達しました。しばらく時間をおいて再度お試しください。"
          : "再設定メールの送信に失敗しました。時間をおいて再度お試しください。"
      );
      setSubmitting(false);
      return;
    }

    // Avoid exposing whether the address exists in auth records.
    setSent(true);
    setMessage("再設定手順をメールで送信しました。メールをご確認ください。");
    setCooldownSeconds(COOLDOWN_SECONDS);
    setSubmitting(false);
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
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="text-xl font-semibold text-slate-900">Infomii</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">パスワードを再設定</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-lg font-semibold text-slate-900">再設定メールを送信</h1>
          <p className="mt-2 text-sm text-slate-500">
            ご登録メールアドレスに再設定用リンクをお送りします。
          </p>

          <div className="mt-4">
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

          {message && (
            <p className={`mt-4 text-sm ${sent ? "text-emerald-600" : "text-red-600"}`}>{message}</p>
          )}

          <div className="mt-6 space-y-2">
            <button
              type="submit"
              disabled={submitting || !hasSupabaseEnv || cooldownSeconds > 0}
              className="app-button-native w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "送信中..."
                : cooldownSeconds > 0
                  ? `再送まで ${cooldownSeconds}秒`
                  : "再設定メールを送信"}
            </button>
            <Link
              href="/login"
              className="app-button-native block w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              ログインへ戻る
            </Link>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}

