"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  /** True while saving / translating before opening preview */
  previewPreparing?: boolean;
  onEditPageBackground?: () => void;
  onBulkFont?: (anchorEl: HTMLElement) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  canClearAll?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onClearAll?: () => void;
  onPreview: () => void;
  onPublish: () => void;
  publishActionLabel?: string;
  onQr: () => void;
  onTogglePublished?: () => void;
  publishToggleLoading?: boolean;
  publishToggleChecked?: boolean;
  onRenamePageTitle?: (nextTitle: string) => Promise<void> | void;
  scrollPriorityMode?: boolean;
  onToggleScrollPriority?: () => void;
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
      <span className="ui-pop-badge flex items-center gap-1.5 text-xs text-amber-600">
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber-500" />
        保存中…
      </span>
    );
  }
  if (lastSavedAt != null) {
    const savedAgoMs = Date.now() - lastSavedAt;
    const justSaved = savedAgoMs >= 0 && savedAgoMs < 4000;
    return (
      <span className="ui-pop-badge flex items-center gap-1.5 text-xs text-slate-500">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
        {justSaved ? "保存しました" : `${formatSavedAt(lastSavedAt)}に保存`}
      </span>
    );
  }
  return <span className="text-xs text-slate-400">未保存</span>;
}

function PreviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

/**
 * Editor top bar — clean, minimal SaaS style.
 * Back | Title | Autosave | … | Preview | Guest publish + CTA | QR
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
  previewPreparing = false,
  onBulkFont,
  canUndo = false,
  canRedo = false,
  canClearAll = false,
  onUndo,
  onRedo,
  onClearAll,
  onPreview,
  onPublish,
  publishActionLabel = "公開",
  onQr,
  onTogglePublished,
  publishToggleLoading = false,
  publishToggleChecked = false,
  onRenamePageTitle,
  scrollPriorityMode = true,
  onToggleScrollPriority,
}: EditorTopBarProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(pageTitle ?? "");
  const [moreOpen, setMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const isPublished = status === "published";
  const canTogglePublish = !demoMode && typeof onTogglePublished === "function";
  const showPublishActionButton =
    !demoMode && (!canTogglePublish || publishActionLabel !== "公開");
  /** デモ時は枠だけ出さない。編集者（トグルなし）はバッジ+CTAで表示 */
  const showPublishCluster = !demoMode && (canTogglePublish || showPublishActionButton);

  async function commitTitle() {
    const next = titleValue.trim();
    const prev = (pageTitle ?? "").trim();
    setEditingTitle(false);
    if (!onRenamePageTitle || next === prev) return;
    await onRenamePageTitle(next);
  }

  return (
    <header
      className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-2 py-1.5 sm:flex-nowrap sm:gap-3 sm:px-4 sm:py-0 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]"
      role="banner"
      aria-label="エディタツールバー"
    >
      {/* Back to dashboard */}
      <Link
        href={backHref}
        className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
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
              className="truncate text-sm font-semibold text-slate-900 [font-family:'M_PLUS_Rounded_1c','Noto_Sans_JP',sans-serif]"
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
              className="hidden rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 lg:inline-flex"
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

      {/* Autosave */}
      <div className="hidden shrink-0 items-center gap-2 sm:flex sm:gap-3">
        <AutosaveStatus saving={saving} lastSavedAt={lastSavedAt} saveError={saveError} onRetry={onRetry} />
      </div>

      {/* Page controls — desktop; mobile uses 「その他」メニュー */}
      <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo || !onUndo}
          className="ui-pop-tap rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          title="ひとつ前に戻す"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo || !onRedo}
          className="ui-pop-tap rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          title="ひとつ先に進む"
        >
          進む
        </button>
        <button
          type="button"
          onClick={onClearAll}
          disabled={!canClearAll || !onClearAll}
          className="ui-pop-tap rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          title="ページ内ブロックを全削除"
        >
          全削除
        </button>
      </div>

      {onBulkFont && (
        <div className="hidden shrink-0 flex-wrap items-center gap-1.5 lg:flex">
          <button
            type="button"
            onClick={(e) => onBulkFont(e.currentTarget)}
            data-bulk-font-anchor="true"
            className="ui-pop-tap rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
            title="ページ内ブロックのフォントを一括変更"
          >
            一括フォント切替
          </button>
        </div>
      )}

      {/* Actions: プレビュー | 公開まわり | QR */}
      <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5 pr-1 sm:gap-2">
        <div className="flex items-center gap-1.5 lg:hidden">
          <span
            className={
              "rounded-full px-2 py-0.5 text-[11px] font-semibold " +
              (isPublished ? "bg-emerald-600 text-white" : "bg-amber-50 text-amber-800")
            }
          >
            {isPublished ? "公開中" : "公開OFF"}
          </span>
          <AutosaveStatus saving={saving} lastSavedAt={lastSavedAt} saveError={saveError} onRetry={onRetry} />
          <button
            type="button"
            onClick={onToggleScrollPriority}
            disabled={!onToggleScrollPriority}
            className={
              "ui-pop-tap rounded-full border px-2 py-0.5 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 " +
              (scrollPriorityMode
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600")
            }
            aria-pressed={scrollPriorityMode}
            aria-label="スクロール優先を切り替え"
          >
            {scrollPriorityMode ? "スクロール優先" : "編集優先"}
          </button>
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo || !onUndo}
            className="ui-pop-tap rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="ひとつ前に戻す"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo || !onRedo}
            className="ui-pop-tap rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="ひとつ先に進む"
          >
            進む
          </button>
        </div>

        {/* sm 以上: プレビュー |（公開）| QR — 先頭に孤立した区切り線が出ないよう 1 本の行にまとめる */}
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={onPreview}
            disabled={!publicUrl || previewPreparing}
            title="保存した内容をゲスト表示で別タブに開きます"
            className="ui-pop-tap flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 lg:min-h-0 lg:py-1.5"
          >
            {previewPreparing ? (
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            ) : (
              <PreviewIcon className="h-4 w-4 shrink-0 text-slate-500" />
            )}
            <span>{previewPreparing ? "準備中…" : "プレビュー"}</span>
          </button>

          {showPublishCluster ? (
            <>
              <div className="h-7 w-px shrink-0 bg-slate-200" aria-hidden />
              <div
                className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-slate-200 bg-slate-50/90 px-2.5 py-2 shadow-sm sm:flex-row sm:items-center sm:gap-3 sm:py-1.5"
                role="group"
                aria-label="公開設定"
              >
                {canTogglePublish ? (
                  <div
                    className="flex min-w-0 items-center gap-2"
                    title={
                      publishToggleChecked
                        ? "ON: 公開URL・QRから閲覧できます。OFFにするとゲストは閲覧できません。"
                        : "OFF: ゲストは閲覧できません。ONにすると公開URL・QRが有効になります。"
                    }
                  >
                    <button
                      type="button"
                      role="switch"
                      aria-checked={publishToggleChecked}
                      aria-label="ゲスト向けの公開"
                      onClick={onTogglePublished}
                      disabled={publishToggleLoading || publishing}
                      className={
                        "relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 " +
                        (publishToggleChecked ? "bg-emerald-600" : "bg-slate-300")
                      }
                    >
                      {publishToggleLoading ? (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/80 border-t-white" />
                        </span>
                      ) : (
                        <span
                          className={
                            "pointer-events-none absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ease-out " +
                            (publishToggleChecked ? "translate-x-5" : "translate-x-0")
                          }
                        />
                      )}
                    </button>
                    <div className="min-w-0 leading-tight">
                      <div className="text-xs font-semibold text-slate-800">ゲスト公開</div>
                      <div className="hidden text-[10px] text-slate-500 lg:block">
                        {publishToggleChecked ? "URL・QRで閲覧可" : "OFFのとき閲覧不可"}
                      </div>
                    </div>
                  </div>
                ) : !demoMode ? (
                  <span
                    className={
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold " +
                      (isPublished ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700")
                    }
                  >
                    {isPublished ? "公開中" : "非公開"}
                  </span>
                ) : null}

                {canTogglePublish && showPublishActionButton ? (
                  <div className="hidden h-8 w-px shrink-0 self-stretch bg-slate-200/90 sm:block" aria-hidden />
                ) : null}

                {showPublishActionButton ? (
                  <button
                    type="button"
                    onClick={onPublish}
                    disabled={publishing || qrPreparing}
                    title="多言語チェックのうえ、編集内容を公開ページへ反映します"
                    className="ui-pop-tap ui-dark-label shrink-0 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:py-1.5"
                  >
                    {publishing ? "処理中…" : publishActionLabel}
                  </button>
                ) : null}
              </div>
            </>
          ) : null}

          <div className="h-7 w-px shrink-0 bg-slate-200" aria-hidden />

          <button
            type="button"
            onClick={onQr}
            disabled={publishing || qrPreparing}
            title="QRコードと公開URLを表示（先に最新の内容を保存します）"
            className="ui-pop-tap flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 lg:min-h-0 lg:py-1.5"
            aria-label="QRコードとURLを表示"
          >
            {qrPreparing ? (
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
            ) : (
              <svg
                className="h-4 w-4 shrink-0 text-slate-500"
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
            <span>{qrPreparing ? "開いています…" : "QR / URL"}</span>
          </button>
        </div>

        {/* Mobile: 編集・言語・元に戻す等 */}
        <div className="relative lg:hidden" ref={moreMenuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMoreOpen((o) => !o);
            }}
            className="ui-pop-tap flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-expanded={moreOpen}
            aria-haspopup="true"
            aria-label="その他の操作"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
          {moreOpen && typeof document !== "undefined" &&
            createPortal(
              <div
                className="ui-pop-in fixed right-2 top-14 z-[140] max-h-[min(360px,65vh)] w-[min(calc(100vw-1rem),300px)] overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
                role="menu"
              >
                <div className="px-4 pb-1 text-[11px] font-semibold tracking-wide text-slate-500">確認</div>
                <button
                  type="button"
                  role="menuitem"
                  disabled={publishing || qrPreparing}
                  className="flex w-full px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => {
                    setMoreOpen(false);
                    onPreview();
                  }}
                >
                  {previewPreparing ? "プレビュー準備中…" : "プレビュー（ゲスト表示）"}
                </button>
                {!demoMode && (
                  <>
                    <div className="border-t border-slate-100" />
                    <div className="px-4 pb-1 pt-2 text-[11px] font-semibold tracking-wide text-slate-500">公開</div>
                    <div className="px-4 pb-2 text-xs leading-relaxed text-slate-500">
                      {isPublished
                        ? "ゲスト公開がONです。編集を反映するには下のボタンを押してください。"
                        : "ゲスト公開がOFFのとき、URL・QRからは閲覧できません。"}
                    </div>
                  </>
                )}
                {canTogglePublish && (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={publishToggleLoading || publishing}
                    className="flex w-full px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                    onClick={() => {
                      setMoreOpen(false);
                      onTogglePublished?.();
                    }}
                  >
                    {publishToggleLoading
                      ? "公開状態を切替中…"
                      : publishToggleChecked
                        ? "ゲスト公開をOFFにする"
                        : "ゲスト公開をONにする"}
                  </button>
                )}
                {showPublishActionButton && (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={publishing || qrPreparing}
                    className="flex w-full px-4 py-3 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-40"
                    onClick={() => {
                      setMoreOpen(false);
                      onPublish();
                    }}
                  >
                    {publishing ? "処理中…" : publishActionLabel}
                  </button>
                )}
                <div className="border-t border-slate-100" />
                <div className="px-4 pb-1 pt-2 text-[11px] font-semibold tracking-wide text-slate-500">共有</div>
                <button
                  type="button"
                  role="menuitem"
                  disabled={publishing || qrPreparing}
                  className="flex w-full px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => {
                    setMoreOpen(false);
                    onQr();
                  }}
                >
                  {qrPreparing ? "QRを準備中…" : "QRコード・公開URL"}
                </button>
                {!demoMode && onRenamePageTitle && (
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                    onClick={() => {
                      setMoreOpen(false);
                      setTitleValue(pageTitle ?? "");
                      setEditingTitle(true);
                    }}
                  >
                    ページ名を変更
                  </button>
                )}
                <div className="border-t border-slate-100" />
                <div className="px-4 pb-1 pt-2 text-[11px] font-semibold tracking-wide text-slate-500">編集操作</div>
                <button
                  type="button"
                  role="menuitem"
                  disabled={!canUndo || !onUndo}
                  className={
                    "flex w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  }
                  onClick={() => {
                    onUndo?.();
                    setMoreOpen(false);
                  }}
                >
                  元に戻す
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={!canRedo || !onRedo}
                  className="flex w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  onClick={() => {
                    onRedo?.();
                    setMoreOpen(false);
                  }}
                >
                  やり直す
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={!canClearAll || !onClearAll}
                  className="flex w-full px-4 py-3 text-left text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-40"
                  onClick={() => {
                    onClearAll?.();
                    setMoreOpen(false);
                  }}
                >
                  ブロックをすべて削除
                </button>
                {onBulkFont && (
                  <>
                    <div className="border-t border-slate-100" />
                    <button
                      type="button"
                      role="menuitem"
                      data-bulk-font-anchor="true"
                      className="flex w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={(e) => {
                        onBulkFont(e.currentTarget);
                        setMoreOpen(false);
                      }}
                    >
                      一括フォント切替
                    </button>
                  </>
                )}
              </div>,
              document.body
            )}
        </div>
      </div>
    </header>
  );
}
