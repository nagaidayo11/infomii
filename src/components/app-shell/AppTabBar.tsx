"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShellLink } from "./AppShellLink";

type TabId = "home" | "templates" | "works" | "plan" | "settings";

type TabConfig = {
  id: TabId;
  label: string;
  href: string;
  match: (pathname: string) => boolean;
  icon: ReactNode;
};

/** 「ページ」= テンプレート、「作成」= 作品一覧（ユーザー要望で入れ替え） */
const TABS: TabConfig[] = [
  {
    id: "home",
    label: "ホーム",
    href: "/dashboard",
    match: (p) => p === "/dashboard" || (p.startsWith("/dashboard/") && !p.startsWith("/dashboard/pages")),
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    id: "templates",
    label: "ページ",
    href: "/templates",
    match: (p) => p.startsWith("/templates"),
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    id: "works",
    label: "作成",
    href: "/dashboard/pages",
    match: (p) => p.startsWith("/dashboard/pages"),
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    id: "plan",
    label: "プラン",
    href: "/settings/billing",
    match: (p) => p.startsWith("/settings/billing"),
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "設定",
    href: "/settings",
    match: (p) => p === "/settings" || (p.startsWith("/settings/") && !p.startsWith("/settings/billing")),
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function AppTabBar() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--app-border)] bg-[var(--app-surface)]/95 backdrop-blur-md"
      style={{
        paddingBottom: "max(0.35rem, var(--infomii-safe-bottom-fallback, env(safe-area-inset-bottom, 0px)))",
      }}
      aria-label="アプリメニュー"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <AppShellLink
              key={tab.id}
              href={tab.href}
              prefetch
              className={
                "ui-pop-tap flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] font-semibold transition-colors " +
                (active ? "text-[var(--app-accent)]" : "text-[var(--app-text-muted)] active:bg-[var(--app-surface-muted)]")
              }
              aria-current={active ? "page" : undefined}
            >
              <span className={active ? "text-[var(--app-accent)]" : "opacity-70"}>{tab.icon}</span>
              <span>{tab.label}</span>
            </AppShellLink>
          );
        })}
      </div>
    </nav>
  );
}

/** Bottom padding for scrollable main content above the tab bar. */
export const APP_TAB_BAR_OFFSET =
  "calc(58px + env(safe-area-inset-bottom, 0px))";
