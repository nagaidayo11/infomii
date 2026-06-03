"use client";

import { Children, type ReactNode } from "react";
type AppSettingsShellProps = {
  children: ReactNode;
};

export function AppSettingsShell({ children }: AppSettingsShellProps) {
  const items = Children.toArray(children).filter(Boolean);

  return (
    <div className="app-settings-page app-shell-page-enter mx-auto w-full max-w-lg space-y-5 pb-8">
      <header className="app-screen-header">
        <h1 className="text-[1.75rem] font-bold text-[var(--app-text)]">設定</h1>
        <p className="app-screen-header-desc text-base text-[var(--app-text-muted)]">
          アカウントの設定
        </p>
      </header>

      <div className="app-settings-groups">
        {items.map((child, index) => (
          <div key={index} className="app-settings-group-item">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
