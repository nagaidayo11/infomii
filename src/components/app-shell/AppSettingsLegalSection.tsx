"use client";

import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { AppShellLink } from "@/components/app-shell/AppShellLink";
import { getLegalPageUrl, SUPPORT_EMAIL } from "@/lib/app-store-compliance";
import { useClientShell } from "@/components/app-shell/useClientShell";

const linkClass =
  "app-pressable flex min-h-[44px] items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-[var(--app-text)]";

export function AppSettingsLegalSection() {
  const { isAppShell } = useClientShell();

  return (
    <AppSettingsCard className="overflow-hidden p-0">
      <div className="border-b border-slate-100/90 px-4 py-3">
        <h2 className="text-base font-semibold text-[var(--app-text)]">サポート・法務</h2>
        <p className="mt-1 text-sm text-[var(--app-text-muted)]">
          お問い合わせと各種ポリシーへのリンクです。
        </p>
      </div>
      <div className="divide-y divide-slate-100/90">
        <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
          <span>お問い合わせ</span>
          <span className="text-[var(--app-text-muted)]">{SUPPORT_EMAIL}</span>
        </a>
        <AppShellLink href={getLegalPageUrl("/terms", isAppShell)} className={linkClass}>
          <span>利用規約</span>
          <span className="text-[var(--app-text-muted)]" aria-hidden>
            ›
          </span>
        </AppShellLink>
        <AppShellLink href={getLegalPageUrl("/privacy", isAppShell)} className={linkClass}>
          <span>プライバシーポリシー</span>
          <span className="text-[var(--app-text-muted)]" aria-hidden>
            ›
          </span>
        </AppShellLink>
        <AppShellLink href={getLegalPageUrl("/commerce", isAppShell)} className={linkClass}>
          <span>特定商取引法に基づく表記</span>
          <span className="text-[var(--app-text-muted)]" aria-hidden>
            ›
          </span>
        </AppShellLink>
      </div>
    </AppSettingsCard>
  );
}
