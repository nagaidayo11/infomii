"use client";

import Link from "next/link";

export type PageCardProps = {
  id: string;
  editHref?: string | null;
  title: string;
  slug: string;
  status: "draft" | "published";
  updatedAt: string;
  views7d?: number;
  qrViews7d?: number;
  onDelete?: (id: string) => void;
  /** false のとき編集・削除を非表示（閲覧権限） */
  canEdit?: boolean;
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
  editHref,
  title,
  slug,
  status,
  updatedAt,
  views7d = 0,
  qrViews7d = 0,
  onDelete,
  canEdit = true,
}: PageCardProps) {
  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/p/${slug}` : `/p/${slug}`;
  const resolvedEditHref = editHref === undefined ? `/editor/${id}` : editHref;

  return (
    <article className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
            {title || ""}
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
          {canEdit && resolvedEditHref && (
          <Link
            href={resolvedEditHref}
            className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium !text-white transition hover:bg-slate-800"
          >
            編集
          </Link>
          )}
          {canEdit && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`${title?.trim() ? `「${title}」を` : "このページを"}削除しますか？`)) onDelete(id);
              }}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              aria-label="削除"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
