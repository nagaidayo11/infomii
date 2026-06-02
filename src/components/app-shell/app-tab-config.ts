export type AppTabId = "home" | "templates" | "works" | "plan" | "settings";

export type AppTabConfig = {
  id: AppTabId;
  label: string;
  href: string;
  match: (pathname: string) => boolean;
};

/** Tab order: ホーム / テンプレート / 作品 / プラン / 設定 */
export const APP_TAB_CONFIGS: AppTabConfig[] = [
  {
    id: "home",
    label: "ホーム",
    href: "/dashboard",
    match: (p) =>
      p === "/dashboard" || (p.startsWith("/dashboard/") && !p.startsWith("/dashboard/pages")),
  },
  {
    id: "templates",
    label: "テンプレート",
    href: "/templates",
    match: (p) => p.startsWith("/templates"),
  },
  {
    id: "works",
    label: "作品",
    href: "/dashboard/pages",
    match: (p) => p.startsWith("/dashboard/pages"),
  },
  {
    id: "plan",
    label: "プラン",
    href: "/settings/billing",
    match: (p) => p.startsWith("/settings/billing"),
  },
  {
    id: "settings",
    label: "設定",
    href: "/settings",
    match: (p) =>
      p === "/settings" || (p.startsWith("/settings/") && !p.startsWith("/settings/billing")),
  },
];

export function resolveAppTabId(pathname: string): AppTabId | null {
  for (const tab of APP_TAB_CONFIGS) {
    if (tab.match(pathname)) return tab.id;
  }
  return null;
}

export function appTabIndex(tabId: AppTabId | null): number {
  if (!tabId) return -1;
  return APP_TAB_CONFIGS.findIndex((t) => t.id === tabId);
}
