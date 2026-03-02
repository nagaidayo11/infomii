"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase-config";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { redeemHotelInvite } from "@/lib/storage";
import { trackOnboardingAuthEvent } from "@/lib/storage";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const search =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const requestedNext =
    search?.get("next") ?? null;
  const next =
    requestedNext && requestedNext.startsWith("/")
      ? requestedNext
      : "/dashboard?tab=create";
  const requestedRef =
    search?.get("ref") ?? null;
  const sourceRef =
    requestedRef === "lp-hero" || requestedRef === "lp-sticky" || requestedRef === "lp-bottom"
      ? requestedRef
      : null;
  const requestedSrc =
    search?.get("src") ?? search?.get("utm_source") ?? null;
  const sourceChannel = requestedSrc ?? null;
  const requestedAb =
    search?.get("ab") ?? null;
  const ctaVariant = requestedAb === "b" || requestedAb === "c" ? requestedAb : "a";
  const requestedLp =
    search?.get("lp") ?? null;
  const landingPage =
    requestedLp === "business" || requestedLp === "resort" || requestedLp === "spa"
      ? requestedLp
      : "unknown";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(next);
    }
  }, [loading, next, router, user]);

  async function signIn(e: FormEvent) {
    e.preventDefault();
    const client = getBrowserSupabaseClient();
    if (!client) {
      setMessage("Supabase設定が未完了です");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(`ログイン失敗: ${error.message}`);
      setSubmitting(false);
      return;
    }

    if (inviteCode.trim()) {
      await redeemHotelInvite(inviteCode.trim());
    }

    await trackOnboardingAuthEvent("login_success", {
      sourceRef,
      sourceChannel,
      ctaVariant,
      landingPage,
    });

    setSubmitting(false);
    router.replace(next);
  }

  async function signUp() {
    const client = getBrowserSupabaseClient();
    if (!client) {
      setMessage("Supabase設定が未完了です");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const { error } = await client.auth.signUp({ email, password });
    if (error) {
      setMessage(`新規登録失敗: ${error.message}`);
      setSubmitting(false);
      return;
    }

    if (inviteCode.trim()) {
      await redeemHotelInvite(inviteCode.trim());
    }

    await trackOnboardingAuthEvent("signup_completed", {
      sourceRef,
      sourceChannel,
      ctaVariant,
      landingPage,
    });

    setSubmitting(false);
    setMessage("登録しました。初回公開ウィザードへ移動します。");
    router.replace("/dashboard?tab=create&wizard=1");
  }

  return (
    <main className="lux-main mx-auto min-h-screen w-full max-w-lg pl-4 pr-6 py-14 sm:pl-6 sm:pr-8">
      <header className="mb-6">
        <p className="lux-kicker text-xs font-medium">Infomii 管理画面</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">ログイン</h1>
        <p className="mt-2 text-sm text-slate-600">
          店舗運営スタッフ向けの管理画面です。
        </p>
      </header>

      {!hasSupabaseEnv && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Supabase設定が未完了です。.env.local を設定してください。
        </div>
      )}

      <form onSubmit={signIn} className="lux-card lux-section-card space-y-4 rounded-2xl p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">メールアドレス</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="manager@store.jp"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">パスワード</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="6文字以上"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">招待コード（任意）</label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-wider"
            placeholder="例: AB12CD34"
            maxLength={16}
          />
          <p className="mt-1 text-xs text-slate-500">スタッフ招待コードがある場合のみ入力してください。</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="lux-btn-primary w-full rounded-xl px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "処理中..." : "ログイン"}
        </button>

        <button
          type="button"
          onClick={signUp}
          disabled={submitting}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          新規登録
        </button>

        {message && <p className="text-sm text-slate-700">{message}</p>}
      </form>

      <p className="mt-4 text-xs text-slate-500">
        公開ページはログイン不要です。<Link className="underline" href="/p/sample">/p/[slug]</Link>
      </p>
    </main>
  );
}
