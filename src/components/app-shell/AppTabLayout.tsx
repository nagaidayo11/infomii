"use client";

import type { ReactNode } from "react";
import { RouteProgressProvider } from "@/components/app/RouteProgressContext";
import { AppScrollReveal } from "./AppScrollReveal";
import { AppTabBar, APP_TAB_BAR_OFFSET } from "./AppTabBar";
import { AppTabTransition } from "./AppTabTransition";
import { AppTapFeedback } from "./AppTapFeedback";

type AppTabLayoutProps = {
  children: ReactNode;
};

/**
 * Native app shell: full-height content + fixed bottom tab bar (5 tabs).
 */
export function AppTabLayout({ children }: AppTabLayoutProps) {
  return (
    <RouteProgressProvider>
      <AppScrollReveal />
      <AppTapFeedback />
      <div className="app-ambient-bg relative flex h-[100dvh] w-full flex-col overflow-hidden">
        <main
          className="app-shell-main relative z-[1] min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4"
          style={{ paddingBottom: APP_TAB_BAR_OFFSET }}
        >
          <AppTabTransition>{children}</AppTabTransition>
        </main>
        <div className="relative z-[1]">
          <AppTabBar />
        </div>
      </div>
    </RouteProgressProvider>
  );
}
