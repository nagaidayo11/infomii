"use client";

import type { ReactNode } from "react";
import { AppAppearanceSection } from "./AppAppearanceSection";

type AppSettingsShellProps = {
  children: ReactNode;
};

export function AppSettingsShell({ children }: AppSettingsShellProps) {
  return (
    <div className="app-shell-page-enter mx-auto w-full max-w-lg space-y-5 pb-8">
      <header>
        <h1 className="text-[1.75rem] font-bold text-[var(--app-text)]">設定</h1>
        <p className="mt-2 text-base text-[var(--app-text-muted)]">
          プラン・アカウント・表示の設定
        </p>
      </header>

      <AppAppearanceSection />

      <div className="space-y-4 [&_section]:app-shell-card [&_section]:overflow-hidden [&_h2]:text-base [&_h2]:font-bold">
        {children}
      </div>
    </div>
  );
}
