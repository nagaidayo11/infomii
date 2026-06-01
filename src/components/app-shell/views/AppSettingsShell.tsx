"use client";

import type { ReactNode } from "react";

type AppSettingsShellProps = {
  children: ReactNode;
};

export function AppSettingsShell({ children }: AppSettingsShellProps) {
  return (
    <div className="app-shell-page-enter mx-auto w-full max-w-lg space-y-5 pb-8">
      <header>
        <h1 className="text-[1.75rem] font-bold text-[var(--app-text)]">設定</h1>
        <p className="mt-2 text-base text-[var(--app-text-muted)]">
          アカウントの設定
        </p>
      </header>

      <div className="space-y-4 [&_section]:app-shell-card [&_section]:overflow-hidden [&_h2]:text-base [&_h2]:font-bold">
        {children}
      </div>
    </div>
  );
}
