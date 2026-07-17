"use client";

import Link from "next/link";

export type FacilityActivityItem = {
  id: string;
  message: string;
  createdAt: string;
};

function formatRelativeJa(iso: string, nowMs = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diffSec = Math.round((nowMs - t) / 1000);
  if (diffSec < 60) return "たった今";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分前`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}時間前`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}日前`;
  return new Date(iso).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

/** Page-edit fallback when audit logs are unavailable. */
export function buildPageUpdateActivity(
  pages: Array<{ id: string; title: string; updatedAt: string }>,
  limit = 5,
): FacilityActivityItem[] {
  return [...pages]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit)
    .map((p) => ({
      id: `page-${p.id}`,
      message: `ページ「${p.title?.trim() || "無題"}」を更新`,
      createdAt: p.updatedAt,
    }));
}

type RecentFacilityActivityProps = {
  items: FacilityActivityItem[];
  loading?: boolean;
  moreHref?: string;
  moreLabel?: string;
  emptyHint?: string;
};

/**
 * Compact facility activity feed — Stripe-calm list, no cards-of-cards.
 */
export function RecentFacilityActivity({
  items,
  loading = false,
  moreHref,
  moreLabel = "詳細を見る",
  emptyHint = "まだ施設内の活動はありません",
}: RecentFacilityActivityProps) {
  return (
    <section>
      <div className="flex items-center justify-between gap-2">
        <h2 className="app-section-title">最近の活動</h2>
        {moreHref ? (
          <Link href={moreHref} className="text-xs font-medium text-slate-500 hover:text-slate-800">
            {moreLabel}
          </Link>
        ) : null}
      </div>
      {loading ? (
        <div className="app-panel mt-3 divide-y divide-[#e6e8eb]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-11 animate-pulse bg-slate-50/80 px-4" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-[#e6e8eb] bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
          {emptyHint}
        </p>
      ) : (
        <ul className="app-panel mt-3 divide-y divide-[#e6e8eb]">
          {items.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
              <p className="min-w-0 flex-1 text-sm leading-snug text-slate-800">{item.message}</p>
              <time
                dateTime={item.createdAt}
                className="shrink-0 text-xs tabular-nums text-slate-400"
                title={new Date(item.createdAt).toLocaleString("ja-JP")}
              >
                {formatRelativeJa(item.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
