"use client";

import Link from "next/link";

export type PageCardProps = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  updatedAt: string;
  views7d?: number;
  qrViews7d?: number;
};

function formatLastUpdated(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "たった今";
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  return new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(d);
}

/**
 * Reusable page card for the Pages list.
 * Shows: page title, status (draft/published), last updated, QR view count.
 * Actions: Edit, View public page.
 */
export function PageCard({
  id,
  title,
  slug,
  status,
  updatedAt,
  views7d = 0,
  qrViews7d = 0,
}: PageCardProps) {
  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/p/${slug}` : `/p/${slug}`;

  return (
    <article className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
            {title || "無題"}
          </h3>
          <dl className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <span
                className={
                  "inline-flex rounded-full px-2 py-0.5 text-xs font-medium " +
                  (status === "published"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600")
                }
              >
                {status === "published" ? "公開中" : "下書き"}
              </span>
            </div>
            <div>
              <span className="sr-only">最終更新</span>
              <span>{formatLastUpdated(updatedAt)}</span>
            </div>
            <div>
              <span className="sr-only">QR閲覧数</span>
              <span className="tabular-nums">QR閲覧 {qrViews7d}</span>
            </div>
          </dl>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            公開ページ
          </Link>
          <Link
            href={`/editor/${id}`}
            className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            編集
          </Link>
        </div>
      </div>
    </article>
  );
}
