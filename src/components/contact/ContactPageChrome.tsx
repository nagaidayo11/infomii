"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AppShellLink } from "@/components/app-shell/AppShellLink";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useAuth } from "@/components/auth-provider";

export function ContactPageChrome({ children }: { children: ReactNode }) {
  const { isAppShell } = useClientShell();
  const { user } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const native = ready && isAppShell;
  const backHref = user ? "/settings" : "/lp/business";
  const backLabel = user ? "設定へ戻る" : "紹介ページへ";

  if (native) {
    return (
      <main className="min-h-[100dvh] bg-[var(--app-bg,#f6f8fa)] px-4 pb-10 pt-6">
        <div className="mx-auto w-full max-w-lg">
          <AppShellLink
            href={backHref}
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-[var(--app-accent)]"
          >
            ← {backLabel}
          </AppShellLink>
          <div className="mt-3">{children}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        {ready && user ? (
          <AppShellLink href="/dashboard" className="mb-3 inline-flex min-h-[40px] items-center text-sm text-emerald-700 hover:underline">
            ← ダッシュボードへ
          </AppShellLink>
        ) : null}
        <article className="lux-card overflow-visible rounded-3xl p-6 sm:p-10">{children}</article>
      </div>
    </main>
  );
}
