"use client";

import type { ReactNode } from "react";

type AppSettingsShellProps = {
  children: ReactNode;
};

export function AppSettingsShell({ children }: AppSettingsShellProps) {
  return (
    <div className="app-settings-page app-shell-page-enter mx-auto w-full max-w-lg pb-8">
      <header className="app-screen-header">
        <h1 className="text-[1.75rem] font-bold text-[var(--app-text)]">設定</h1>
        <p className="app-screen-header-desc mt-1 text-[0.9375rem] leading-relaxed text-[var(--app-text-muted)]">
          アカウントや施設情報をまとめて管理できます。
        </p>
      </header>

      <div className="app-settings-groups">{children}</div>
    </div>
  );
}
