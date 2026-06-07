"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShellLink } from "@/components/app-shell/AppShellLink";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { FadeIn } from "@/components/motion";
import { withAppClientQuery } from "@/lib/app-href";

function AuthConfirmedInner() {
  const { isAppShell } = useClientShell();
  const searchParams = useSearchParams();
  const isAppClient = isAppShell || searchParams.get("client") === "app";
  const loginHref = isAppClient ? withAppClientQuery("/login?confirmed=1") : "/login?confirmed=1";

  return (
    <div
      className={
        isAppClient
          ? "app-shell-page-enter flex min-h-[100dvh] flex-col justify-center bg-[var(--app-bg)] px-4 py-6"
          : "flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 px-4 py-10"
      }
    >
      <FadeIn className="mx-auto w-full max-w-md">
        <div
          className={
            isAppClient
              ? "app-shell-card p-6 text-center"
              : "rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
          }
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-900">メールアドレスを確認しました</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            登録ありがとうございます。メールアドレスとパスワードでログインして、ページ作成を始められます。
          </p>
          {isAppClient ? (
            <AppShellLink
              href={loginHref}
              className="app-touch-btn mt-6 inline-flex w-full items-center justify-center bg-[var(--app-accent)] font-semibold text-white"
            >
              ログイン画面へ
            </AppShellLink>
          ) : (
            <Link
              href={loginHref}
              className="app-button-native mt-6 inline-flex w-full min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white hover:bg-slate-800"
            >
              ログイン画面へ
            </Link>
          )}
        </div>
      </FadeIn>
    </div>
  );
}

export default function AuthConfirmedPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[100dvh] max-w-md items-center justify-center px-4">
          <p className="text-sm text-slate-600">読み込み中…</p>
        </main>
      }
    >
      <AuthConfirmedInner />
    </Suspense>
  );
}
