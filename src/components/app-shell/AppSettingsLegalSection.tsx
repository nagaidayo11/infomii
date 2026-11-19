"use client";

import { AppListRow } from "@/components/app-shell/primitives/AppListRow";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { AppShellLink } from "@/components/app-shell/AppShellLink";
import { getLegalPageUrl } from "@/lib/app-store-compliance";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { AppSettingsIconLegal, AppSettingsIconSupport } from "./icons/AppSettingsIcons";

const webLinkClass =
  "app-pressable flex min-h-[44px] items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-[var(--app-text)]";

export function AppSettingsLegalSection() {
  const { isAppShell } = useClientShell();

  if (isAppShell) {
    return (
      <AppSettingsCard className="app-settings-legal-card overflow-hidden p-0">
        <div className="app-settings-legal-list">
          <AppListRow
            href="/contact"
            title="ご意見・ご相談"
            subtitle="使いづらさや機能の要望など"
            leading={<AppSettingsIconSupport size={24} />}
          />
          <AppListRow
            href={getLegalPageUrl("/terms", isAppShell)}
            title="利用規約"
            leading={<AppSettingsIconLegal size={24} />}
          />
          <AppListRow
            href={getLegalPageUrl("/privacy", isAppShell)}
            title="プライバシーポリシー"
            leading={<AppSettingsIconLegal size={24} />}
          />
          <AppListRow
            href={getLegalPageUrl("/commerce", isAppShell)}
            title="特定商取引法に基づく表記"
            leading={<AppSettingsIconLegal size={24} />}
          />
        </div>
      </AppSettingsCard>
    );
  }

  return (
    <AppSettingsCard className="app-settings-legal-card overflow-hidden p-0">
      <div className="app-settings-legal-list divide-y divide-slate-100/90">
        <AppShellLink href="/contact" className={webLinkClass}>
          <span>ご意見・ご相談</span>
          <span className="text-[var(--app-text-muted)]">気軽にメールできます</span>
        </AppShellLink>
        <AppShellLink href={getLegalPageUrl("/terms", isAppShell)} className={webLinkClass}>
          <span>利用規約</span>
          <span className="text-[var(--app-text-muted)]" aria-hidden>
            ›
          </span>
        </AppShellLink>
        <AppShellLink href={getLegalPageUrl("/privacy", isAppShell)} className={webLinkClass}>
          <span>プライバシーポリシー</span>
          <span className="text-[var(--app-text-muted)]" aria-hidden>
            ›
          </span>
        </AppShellLink>
        <AppShellLink href={getLegalPageUrl("/commerce", isAppShell)} className={webLinkClass}>
          <span>特定商取引法に基づく表記</span>
          <span className="text-[var(--app-text-muted)]" aria-hidden>
            ›
          </span>
        </AppShellLink>
      </div>
    </AppSettingsCard>
  );
}
