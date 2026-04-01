"use client";

import Link from "next/link";
import { useState } from "react";

export type EditorTopBarProps = {
  backHref?: string;
  demoMode?: boolean;
  pageTitle: string;
  saving: boolean;
  lastSavedAt: number | null;
  saveError?: string | null;
  onRetry?: () => void;
  status?: "draft" | "published";
  publicUrl: string | null;
  publishing?: boolean;
  /** True while opening QR modal (save only); distinct from full publish flow */
  qrPreparing?: boolean;
  onEditPageBackground?: () => void;
  onBulkFont?: () => void;
  locale?: "ja" | "en" | "zh" | "ko";
  onChangeLocale?: (locale: "ja" | "en" | "zh" | "ko") => void;
  localeTranslating?: boolean;
  translationEnabled?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  canClearAll?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onClearAll?: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onQr: () => void;
  onTogglePublished?: () => void;
  publishToggleLoading?: boolean;
  publishToggleChecked?: boolean;
  onRenamePageTitle?: (nextTitle: string) => Promise<void> | void;
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
  saveError,
  onRetry,
}: {
  saving: boolean;
  lastSavedAt: number | null;
  saveError: string | null;
  onRetry?: () => void;
}) {
  if (saveError) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <span className="text-red-600">{saveError}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded px-2 py-0.5 font-medium text-red-700 underline hover:no-underline"
          >
            再試行
          </button>
        )}
      </span>
    );
  }
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
  backHref = "/dashboard",
  demoMode = false,
  pageTitle,
  saving,
  lastSavedAt,
  saveError = null,
  onRetry,
  status = "draft",
  publicUrl,
  publishing = false,
  qrPreparing = false,
  onEditPageBackground,
  onBulkFont,
  locale = "ja",
  onChangeLocale,
  localeTranslating = false,
  translationEnabled = true,
  canUndo = false,
  canRedo = false,
  canClearAll = false,
  onUndo,
  onRedo,
  onClearAll,
  onPreview,
  onPublish,
  onQr,
  onTogglePublished,
  publishToggleLoading = false,
  publishToggleChecked = false,
  onRenamePageTitle,
}: EditorTopBarProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(pageTitle ?? "");

  async function commitTitle() {
    const next = titleValue.trim();
    const prev = (pageTitle ?? "").trim();
    setEditingTitle(false);
    if (!onRenamePageTitle || next === prev) return;
    await onRenamePageTitle(next);
  }

  return (
    <header
      className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4"
      role="banner"
      aria-label="エディタツールバー"
    >
      {/* Back to dashboard */}
      <Link
        href={backHref}
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
        <span className="hidden sm:inline">{backHref === "/dashboard" ? "ダッシュボード" : "戻る"}</span>
      </Link>

      <div className="h-4 w-px shrink-0 bg-slate-200/80" aria-hidden />

      {/* Page title */}
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
                  setTitleValue(pageTitle ?? "");
                  setEditingTitle(false);
                }
              }}
              autoFocus
              className="w-full max-w-[280px] rounded-md border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
            />
          ) : (
            <h1
              className="truncate text-sm font-semibold text-slate-900"
              title={pageTitle}
            >
              {pageTitle || ""}
            </h1>
          )}
          {!demoMode && onRenamePageTitle && !editingTitle && (
            <button
              type="button"
              onClick={() => {
                setTitleValue(pageTitle ?? "");
                setEditingTitle(true);
              }}
              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
            >
              名前変更
            </button>
          )}
          {demoMode && (
            <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              デモ
            </span>
          )}
        </div>
      </div>

      {/* Autosave + draft/published */}
      <div className="flex items-center gap-3">
        <AutosaveStatus saving={saving} lastSavedAt={lastSavedAt} saveError={saveError} onRetry={onRetry} />
        <span
          className={
            status === "published"
              ? "rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
              : "rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
          }
        >
          {status === "published" ? "公開済み" : "下書き"}
        </span>
        {!demoMode && onTogglePublished && (
          <button
            type="button"
            onClick={onTogglePublished}
            disabled={publishToggleLoading}
            className={
              "rounded-full border px-2 py-0.5 text-xs font-medium transition " +
              (publishToggleChecked
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600") +
              " disabled:opacity-50"
            }
          >
            {publishToggleLoading ? "切替中…" : publishToggleChecked ? "公開ON" : "公開OFF"}
          </button>
        )}
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo || !onUndo}
          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          title="ひとつ前に戻す"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo || !onRedo}
          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          title="ひとつ先に進む"
        >
          進む
        </button>
        <button
          type="button"
          onClick={onClearAll}
          disabled={!canClearAll || !onClearAll}
          className="rounded-md px-2.5 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          title="ページ内ブロックを全削除"
        >
          全削除
        </button>
      </div>

      {onEditPageBackground && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onEditPageBackground}
            className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
            title="ページ背景を編集"
          >
            背景
          </button>
          {onBulkFont && (
            <button
              type="button"
              onClick={onBulkFont}
              className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
              title="ページ内ブロックのフォントを一括変更"
            >
              一括フォント
            </button>
          )}
          {onChangeLocale && (
            <div className="ml-1 flex items-center gap-1">
              {localeTranslating && (
                <span className="mr-1 inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                  翻訳中…
                </span>
              )}
              {[
                { code: "ja", label: "JA" },
                { code: "en", label: "EN" },
                { code: "zh", label: "中文" },
                { code: "ko", label: "한국어" },
              ].map((item) => {
                const active = locale === item.code;
                const disabledByPlan = !translationEnabled && item.code !== "ja";
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onChangeLocale(item.code as "ja" | "en" | "zh" | "ko")}
                    disabled={localeTranslating || disabledByPlan}
                    className={
                      "rounded-md border px-2 py-1 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-60 " +
                      (active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
                    }
                    title={
                      disabledByPlan
                        ? "Businessプランで利用できます"
                        : `表示言語: ${item.label}`
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Actions: Preview, Publish (full flow), QR (saved published page only) */}
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
          disabled={publishing || qrPreparing}
          title="翻訳チェック・公開前確認のうえ、保存して公開します"
          className="rounded-md bg-slate-900 px-2.5 py-1.5 text-sm font-medium !text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {publishing ? "公開中…" : "公開"}
        </button>
        <button
          type="button"
          onClick={onQr}
          disabled={publishing || qrPreparing}
          title="公開済みのページのQR・URLを表示（最新内容を保存してから開きます）"
          className={
            "flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 " +
            (qrPreparing ? "border-slate-200" : "")
          }
          aria-label="QRコードを表示"
        >
          {qrPreparing ? (
            <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-slate-400 border-t-slate-800" />
          ) : (
            <svg
              className="h-3.5 w-3.5 shrink-0 text-slate-800"
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
          <span className="hidden sm:inline">{qrPreparing ? "表示中…" : "QR"}</span>
        </button>
      </div>
    </header>
  );
}
