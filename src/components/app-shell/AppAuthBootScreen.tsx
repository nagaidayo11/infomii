"use client";

import { APP_TAB_BAR_OFFSET, APP_TAB_BAR_SAFE_INSET } from "./app-tab-metrics";
import { APP_TAB_CONFIGS } from "./app-tab-config";

type AppAuthBootScreenProps = {
  /** Tab shell for dashboard routes; minimal chrome for editor */
  variant?: "tabs" | "editor";
};

function DashboardBootSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-5 pb-4">
      <div className="app-shell-skeleton h-10 w-40 rounded-xl" aria-hidden />
      <div className="app-shell-skeleton h-40 rounded-2xl" aria-hidden />
      <div className="app-shell-skeleton h-24 rounded-2xl" aria-hidden />
      <div className="app-shell-skeleton h-20 rounded-2xl" aria-hidden />
    </div>
  );
}

function EditorBootSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="app-shell-skeleton h-12 shrink-0 border-b border-[var(--app-border)]" aria-hidden />
      <div className="min-h-0 flex-1 space-y-3 p-4">
        <div className="app-shell-skeleton h-48 rounded-2xl" aria-hidden />
        <div className="app-shell-skeleton h-32 rounded-2xl" aria-hidden />
        <div className="app-shell-skeleton h-24 rounded-2xl" aria-hidden />
      </div>
    </div>
  );
}

function TabBarPlaceholder() {
  return (
    <nav
      className="app-auth-boot-tabbar pointer-events-none fixed inset-x-0 bottom-0 z-50 border-t border-[var(--app-border)] bg-[var(--app-surface)]/95 backdrop-blur-md"
      aria-hidden
    >
      <div
        className="relative mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1"
        style={{ paddingBottom: APP_TAB_BAR_SAFE_INSET }}
      >
        {APP_TAB_CONFIGS.map((tab) => (
          <div
            key={tab.id}
            className="flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium text-[var(--app-text-muted)] opacity-50"
          >
            <span className="app-shell-skeleton h-6 w-6 rounded-md" />
            <span>{tab.label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}

/**
 * App WebView boot state while auth/session scope resolves — matches tab shell + dashboard skeleton (no technical copy).
 */
export function AppAuthBootScreen({ variant = "tabs" }: AppAuthBootScreenProps) {
  const showTabBar = variant === "tabs";

  return (
    <div
      className="app-auth-boot app-ambient-bg flex h-[100dvh] w-full flex-col overflow-hidden"
      role="status"
      aria-busy="true"
      aria-label="起動中"
    >
      <main
        className="app-shell-main min-h-0 flex-1 overflow-hidden px-4"
        style={{ paddingBottom: showTabBar ? APP_TAB_BAR_OFFSET : undefined }}
      >
        {variant === "editor" ? <EditorBootSkeleton /> : <DashboardBootSkeleton />}
      </main>
      {showTabBar ? <TabBarPlaceholder /> : null}
    </div>
  );
}
