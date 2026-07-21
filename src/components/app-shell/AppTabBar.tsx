"use client";

import { LayoutGroup, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { APP_TAB_ICON_COMPONENTS } from "./icons/AppIconSet";
import { APP_TAB_CONFIGS, type AppTabId } from "./app-tab-config";
import { AppShellLink } from "./AppShellLink";

export function AppTabBar() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="app-tab-bar-nav fixed inset-x-0 bottom-0 z-50 border-t border-[var(--app-border)] bg-[var(--app-surface)]/95 backdrop-blur-md"
      aria-label="アプリメニュー"
    >
      <LayoutGroup id="app-tab-bar">
        <div className="relative mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {APP_TAB_CONFIGS.map((tab) => {
            const active = tab.match(pathname);
            const Icon = APP_TAB_ICON_COMPONENTS[tab.id as AppTabId];
            return (
              <AppShellLink
                key={tab.id}
                href={tab.href}
                prefetch
                className={
                  "ui-pop-tap relative flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] font-semibold transition-colors " +
                  (active
                    ? "text-[var(--app-accent)]"
                    : "text-[var(--app-text-muted)] active:bg-[var(--app-surface-muted)]")
                }
                aria-current={active ? "page" : undefined}
              >
                {active ? (
                  <motion.span
                    layoutId="app-tab-indicator"
                    className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-[var(--app-accent)]"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    aria-hidden
                  />
                ) : null}
                <span className={active ? "opacity-100" : "opacity-72"}>
                  <Icon size={24} />
                </span>
                <span>{tab.label}</span>
              </AppShellLink>
            );
          })}
        </div>
      </LayoutGroup>
    </nav>
  );
}

export { APP_TAB_BAR_OFFSET, APP_FAB_BOTTOM_OFFSET, APP_SCROLL_WITH_FAB_PADDING } from "./app-tab-metrics";
