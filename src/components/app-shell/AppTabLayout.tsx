"use client";

import type { ReactNode } from "react";
import { AppTabBar, APP_TAB_BAR_OFFSET } from "./AppTabBar";

type AppTabLayoutProps = {
  children: ReactNode;
};

/**
 * Native app shell: full-height content + fixed bottom tab bar (5 tabs).
 * Not used on web responsive layouts.
 */
export function AppTabLayout({ children }: AppTabLayoutProps) {
  return (
    <div className="app-ambient-bg flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-100/90">
      <main
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4 sm:px-6 sm:pt-6"
        style={{ paddingBottom: APP_TAB_BAR_OFFSET }}
      >
        {children}
      </main>
      <AppTabBar />
    </div>
  );
}
