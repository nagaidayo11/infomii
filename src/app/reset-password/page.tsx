"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { hasSupabaseEnv } from "@/lib/supabase-config";
import { FadeIn } from "@/components/motion";

type LinkState = "checking" | "valid" | "invalid";

export default function ResetPasswordPage() {
  const client = getBrowserSupabaseClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [updated, setUpdated] = useState(false);
  const [linkState, setLinkState] = useState<LinkState>(client ? "checking" : "invalid");

  useEffect(() => {
    if (!client) {
      return;
    }

    let active = true;

    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setLinkState(data.session ? "valid" : "invalid");
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setLinkState(session ? "valid" : "invalid");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setMessage("パスワードは6文字以上で入力してください。");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("確認用パスワードが一致しません。");
      return;
    }

    if (!client) {
      setMessage("Supabase の設定が未完了です。.env.local を確認してください。");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setUpdated(false);

    const { error } = await client.auth.updateUser({ password });
    if (error) {
      setMessage("パスワードの更新に失敗しました。リンクの有効期限をご確認ください。");
      setSubmitting(false);
      return;
    }

    setUpdated(true);
    setMessage("パスワードを更新しました。ログインしてください。");
    setSubmitting(false);
  }

  const linkInvalid = linkState === "invalid";

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
          <p className="mt-2 text-sm text-slate-500">新しいパスワードを設定</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-lg font-semibold text-slate-900">パスワードを更新</h1>

          {linkState === "checking" && (
            <p className="mt-3 text-sm text-slate-500">リンクを確認中です...</p>
          )}

          {linkInvalid && (
            <p className="mt-3 text-sm text-rose-600">
              リンクの有効期限が切れているか、無効です。再度お試しください。
            </p>
          )}

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                新しいパスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting || linkInvalid || linkState === "checking"}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                placeholder="6文字以上"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                新しいパスワード（確認）
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting || linkInvalid || linkState === "checking"}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                placeholder="確認のためもう一度入力"
              />
            </div>
          </div>

          {message && (
            <p className={`mt-4 text-sm ${updated ? "text-emerald-600" : "text-rose-600"}`}>{message}</p>
          )}

          <div className="mt-6 space-y-2">
            <button
              type="submit"
              disabled={submitting || !hasSupabaseEnv || linkInvalid || linkState === "checking"}
              className="app-button-native w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "更新中..." : "パスワードを更新"}
            </button>
            <Link
              href={linkInvalid ? "/forgot-password" : "/login"}
              className="app-button-native block w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              {linkInvalid ? "再設定メールを再送する" : "ログインへ戻る"}
            </Link>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}

