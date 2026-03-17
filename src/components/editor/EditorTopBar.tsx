"use client";

import Link from "next/link";

export type EditorTopBarProps = {
  pageTitle: string;
  saving: boolean;
  lastSavedAt: number | null;
  status?: "draft" | "published";
  publicUrl: string | null;
  publishing?: boolean;
  onPreview: () => void;
  onPublish: () => void;
  onQr: () => void;
};

function formatSavedAt(ms: number): string {
  const sec = Math.floor((Date.now() - ms) / 1000);
  if (sec < 10) return "たった今";
  if (sec < 60) return `${sec}秒前`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

function AutosaveStatus({
  saving,
  lastSavedAt,
}: {
  saving: boolean;
  lastSavedAt: number | null;
}) {
  if (saving) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-600">
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber-500" />
        保存中…
      </span>
    );
  }
  if (lastSavedAt != null) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
        {formatSavedAt(lastSavedAt)}に保存
      </span>
    );
  }
  return <span className="text-xs text-slate-400">未保存</span>;
}

/**
 * Editor top bar — clean, minimal SaaS style.
 * Back | Title | Autosave + Status | Preview | Publish | QR
 */
export function EditorTopBar({
  pageTitle,
  saving,
  lastSavedAt,
  status = "draft",
  publicUrl,
  publishing = false,
  onPreview,
  onPublish,
  onQr,
}: EditorTopBarProps) {
  return (
    <header
      className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4"
      role="banner"
      aria-label="エディタツールバー"
    >
      {/* Back to dashboard */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        aria-label="ダッシュボードに戻る"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="hidden sm:inline">ダッシュボード</span>
      </Link>

      <div className="h-4 w-px shrink-0 bg-slate-200/80" aria-hidden />

      {/* Page title */}
      <div className="min-w-0 flex-1">
        <h1
          className="truncate text-sm font-semibold text-slate-900"
          title={pageTitle}
        >
          {pageTitle || "無題のページ"}
        </h1>
      </div>

      {/* Autosave + draft/published */}
      <div className="flex items-center gap-3">
        <AutosaveStatus saving={saving} lastSavedAt={lastSavedAt} />
        <span
          className={
            status === "published"
              ? "rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
              : "rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
          }
        >
          {status === "published" ? "公開済み" : "下書き"}
        </span>
      </div>

      {/* Actions: Preview, Publish, QR */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onPreview}
          disabled={!publicUrl}
          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          プレビュー
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing}
          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {publishing ? "公開中…" : "公開"}
        </button>
        <button
          type="button"
          onClick={onQr}
          disabled={publishing}
          className="flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="QRコード"
        >
          {publishing ? (
            <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <path d="M14 14h1v4h4v-4" />
              <path d="M14 17h4" />
            </svg>
          )}
          <span className="hidden sm:inline">{publishing ? "公開中…" : "QR"}</span>
        </button>
      </div>
    </header>
  );
}
