"use client";

import { AppShellLink } from "./AppShellLink";

type AppHomeStatsStripProps = {
  pageCount: number;
  publishedCount: number;
  totalViews7d: number;
};

/** One-line home stats — tap through to analytics. */
export function AppHomeStatsStrip({ pageCount, publishedCount, totalViews7d }: AppHomeStatsStripProps) {
  return (
    <AppShellLink
      href="/dashboard/analytics"
      className="app-home-stats-strip app-pressable ui-pop-tap flex items-center justify-between gap-3 no-underline"
      aria-label="ページの反応を見る"
    >
      <p className="min-w-0 flex-1 truncate text-sm text-[var(--app-text-muted)]">
        <span className="font-semibold text-[var(--app-text)]">公開 {publishedCount}</span>
        <span aria-hidden> · </span>
        作成 {pageCount}
        <span aria-hidden> · </span>
        7日 {totalViews7d.toLocaleString("ja-JP")} 閲覧
      </p>
      <span className="shrink-0 text-xs font-semibold text-[var(--app-accent)]">反応を見る</span>
    </AppShellLink>
  );
}
