"use client";

import Link from "next/link";
import { useState } from "react";
import { buildPublicUrlV } from "@/lib/storage";
import type { LiveOpsKey } from "@/lib/editor/live-ops";
import { LiveOpsPageRowActions } from "@/components/ops/LiveOpsPageRowActions";

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
  onRename?: (id: string, nextTitle: string) => Promise<void> | void;
  onTogglePublish?: (id: string, nextStatus: "draft" | "published") => Promise<void> | void;
  publishToggling?: boolean;
  /** false のとき編集・削除を非表示（閲覧権限） */
  canEdit?: boolean;
  /** Live-ops keys present on this page (show Quick Ops links when non-empty). */
  liveOpsKeys?: LiveOpsKey[];
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
  onRename,
  onTogglePublish,
  publishToggling = false,
  canEdit = true,
  liveOpsKeys = [],
}: PageCardProps) {
  const publicUrl = buildPublicUrlV(slug);
  const resolvedEditHref = editHref === undefined ? `/editor/${id}` : editHref;
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title ?? "");
  const [navigating, setNavigating] = useState(false);

  async function commitTitle() {
    const next = titleValue.trim();
    const prev = (title ?? "").trim();
    setEditingTitle(false);
    if (!onRename || next === prev) return;
    await onRename(id, next);
  }

  return (
    <article className="rounded-lg border border-[#e6e8eb] bg-white p-4 transition hover:border-slate-300 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {editingTitle ? (
              <input
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={() => void commitTitle()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void commitTitle();
                  }
                  if (e.key === "Escape") {
                    setTitleValue(title ?? "");
                    setEditingTitle(false);
                  }
                }}
                autoFocus
                className="w-full max-w-md rounded-md border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
              />
            ) : (
              <h3 className="truncate text-[15px] font-semibold text-slate-900">
                {title || ""}
              </h3>
            )}
            {canEdit && onRename && !editingTitle && (
              <button
                type="button"
                onClick={() => {
                  setTitleValue(title ?? "");
                  setEditingTitle(true);
                }}
                className="app-button-native inline-flex shrink-0 items-center rounded-md border border-[#e6e8eb] bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                名前変更
              </button>
            )}
          </div>
          <dl className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-normal text-slate-500">
            <div className="flex items-center gap-2">
              <span
                className={
                  status === "published" ? "text-emerald-700" : "text-slate-500"
                }
              >
                {status === "published" ? "公開中" : "下書き"}
              </span>
              {canEdit && onTogglePublish && (
                <button
                  type="button"
                  disabled={publishToggling}
                  onClick={() => void onTogglePublish(id, status === "published" ? "draft" : "published")}
                  className={
                    "app-button-native inline-flex items-center p-0 text-sm font-normal transition disabled:opacity-50 " +
                    (status === "published"
                      ? "text-emerald-700 hover:text-emerald-800"
                      : "text-slate-500 hover:text-slate-600")
                  }
                >
                  {publishToggling ? "切替中…" : status === "published" ? "公開ON" : "公開OFF"}
                </button>
              )}
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
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {canEdit ? <LiveOpsPageRowActions pageId={id} keys={liveOpsKeys} /> : null}
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="app-button-native inline-flex min-h-[40px] flex-1 items-center justify-center rounded-md border border-[#e6e8eb] bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:min-h-0 sm:flex-initial"
          >
            公開ページ
          </Link>
          {canEdit && resolvedEditHref && (
          <Link
            href={resolvedEditHref}
            onClick={() => setNavigating(true)}
            className="app-button-native inline-flex min-h-[40px] flex-1 items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium !text-white transition hover:bg-slate-800 sm:min-h-0 sm:flex-initial"
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
              className="app-button-native inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#e6e8eb] bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:min-h-0"
              aria-label="削除"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {navigating && (
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          ページへ移動中…
        </div>
      )}
    </article>
  );
}
