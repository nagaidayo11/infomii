"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { EditorTopBarProps } from "@/components/editor/EditorTopBar";
import { AppShellLink } from "./AppShellLink";

type EditorAppTopBarProps = Pick<
  EditorTopBarProps,
  | "backHref"
  | "demoMode"
  | "pageTitle"
  | "saving"
  | "lastSavedAt"
  | "saveError"
  | "onRetry"
  | "publicUrl"
  | "previewPreparing"
  | "publishing"
  | "qrPreparing"
  | "onPreview"
  | "onPublish"
  | "publishActionLabel"
  | "onQr"
  | "onTogglePublished"
  | "publishToggleLoading"
  | "publishToggleChecked"
  | "onUndo"
  | "onRedo"
  | "canUndo"
  | "canRedo"
  | "onClearAll"
  | "canClearAll"
  | "onRenamePageTitle"
  | "onBulkFont"
>;

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
 * Canva-style editor header for native app shell: home | publish toggle | preview (+ overflow menu).
 */
export function EditorAppTopBar({
  backHref = "/dashboard",
  demoMode = false,
  pageTitle,
  saving,
  lastSavedAt,
  saveError,
  onRetry,
  publicUrl,
  previewPreparing = false,
  publishing = false,
  qrPreparing = false,
  onPreview,
  onPublish,
  publishActionLabel = "公開",
  onQr,
  onTogglePublished,
  publishToggleLoading = false,
  publishToggleChecked = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onClearAll,
  canClearAll = false,
  onRenamePageTitle,
  onBulkFont,
}: EditorAppTopBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (moreMenuRef.current?.contains(target)) return;
      if (moreMenuPanelRef.current?.contains(target)) return;
      setMoreOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  const canTogglePublish = !demoMode && typeof onTogglePublished === "function";
  const showPublishActionButton =
    !demoMode && (!canTogglePublish || publishActionLabel !== "公開");

  let saveHint = "未保存";
  if (saveError) {
    saveHint = "保存エラー";
  } else if (saving) {
    saveHint = "保存中…";
  } else if (lastSavedAt != null) {
    saveHint = "保存済み";
  }

  return (
    <header
      className="editor-app-topbar flex min-h-[52px] shrink-0 items-center gap-2 border-b border-teal-700/20 bg-gradient-to-r from-teal-600 to-teal-500 px-2 pb-1.5 text-white shadow-sm"
      style={{
        paddingTop: "0.375rem",
        paddingLeft: "max(0.5rem, var(--infomii-safe-left-fallback, env(safe-area-inset-left, 0px)))",
        paddingRight: "max(0.5rem, var(--infomii-safe-right-fallback, env(safe-area-inset-right, 0px)))",
      }}
      role="banner"
      aria-label="エディタ（アプリ）"
    >
      <AppShellLink
        href={backHref}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 transition active:bg-white/25"
        aria-label="ホームに戻る"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </AppShellLink>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight">{pageTitle || "編集中"}</p>
        <p className="truncate text-[10px] text-teal-50/90">{saveHint}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {canTogglePublish ? (
          <button
            type="button"
            role="switch"
            aria-checked={publishToggleChecked}
            aria-label="ゲスト向けの公開"
            onClick={onTogglePublished}
            disabled={publishToggleLoading || publishing}
            className={
              "relative h-8 w-[52px] shrink-0 rounded-full transition-colors disabled:opacity-50 " +
              (publishToggleChecked ? "bg-emerald-400" : "bg-white/30")
            }
          >
            {publishToggleLoading ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/80 border-t-white" />
              </span>
            ) : (
              <span
                className={
                  "pointer-events-none absolute top-0.5 left-0.5 h-7 w-7 rounded-full bg-white shadow transition-transform " +
                  (publishToggleChecked ? "translate-x-[22px]" : "translate-x-0")
                }
              />
            )}
          </button>
        ) : null}

        <button
          type="button"
          onClick={onPreview}
          disabled={!publicUrl || previewPreparing}
          className="flex h-10 min-w-[44px] items-center justify-center gap-1 rounded-xl bg-white/15 px-2.5 text-xs font-semibold disabled:opacity-40"
          aria-label="プレビュー"
        >
          {previewPreparing ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <PreviewIcon className="h-5 w-5" />
          )}
          <span className="hidden min-[380px]:inline">プレビュー</span>
        </button>

        <div className="relative" ref={moreMenuRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"
            aria-expanded={moreOpen}
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
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-[139] bg-slate-900/30"
                  aria-label="メニューを閉じる"
                  onClick={() => setMoreOpen(false)}
                />
                <div
                  ref={moreMenuPanelRef}
                  className="fixed right-2 z-[140] max-h-[min(360px,65vh)] w-[min(calc(100vw-1rem),300px)] overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 text-slate-900 shadow-xl"
                  style={{
                    top: "calc(3.25rem + var(--infomii-safe-top-fallback, env(safe-area-inset-top, 0px)))",
                  }}
                  role="menu"
                >
                  {saveError ? (
                    <div className="border-b border-slate-100 px-4 py-2 text-xs text-rose-600">
                      {saveError}
                      {onRetry ? (
                        <button type="button" className="ml-2 underline" onClick={onRetry}>
                          再試行
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    role="menuitem"
                    disabled={publishing || qrPreparing}
                    className="flex w-full px-4 py-3 text-left text-sm font-medium hover:bg-slate-50 disabled:opacity-40"
                    onClick={() => {
                      setMoreOpen(false);
                      onQr();
                    }}
                  >
                    {qrPreparing ? "QRを準備中…" : "QRコード・公開URL"}
                  </button>
                  {showPublishActionButton ? (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={publishing || qrPreparing}
                      className="flex w-full px-4 py-3 text-left text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
                      onClick={() => {
                        setMoreOpen(false);
                        onPublish();
                      }}
                    >
                      {publishing ? "処理中…" : publishActionLabel}
                    </button>
                  ) : null}
                  {onRenamePageTitle ? (
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
                      onClick={() => {
                        setMoreOpen(false);
                        const next = window.prompt("ページ名", pageTitle ?? "");
                        if (next != null && next.trim()) void onRenamePageTitle(next.trim());
                      }}
                    >
                      ページ名を変更
                    </button>
                  ) : null}
                  <button
                    type="button"
                    role="menuitem"
                    disabled={!canUndo || !onUndo}
                    className="flex w-full px-4 py-3 text-left text-sm hover:bg-slate-50 disabled:opacity-40"
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
                    className="flex w-full px-4 py-3 text-left text-sm hover:bg-slate-50 disabled:opacity-40"
                    onClick={() => {
                      onRedo?.();
                      setMoreOpen(false);
                    }}
                  >
                    やり直す
                  </button>
                  {onClearAll ? (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={!canClearAll}
                      className="flex w-full px-4 py-3 text-left text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-40"
                      onClick={() => {
                        onClearAll();
                        setMoreOpen(false);
                      }}
                    >
                      ブロックをすべて削除
                    </button>
                  ) : null}
                  {onBulkFont ? (
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
                      onClick={(e) => {
                        onBulkFont(e.currentTarget);
                        setMoreOpen(false);
                      }}
                    >
                      一括フォント切替
                    </button>
                  ) : null}
                </div>
              </>,
              document.body,
            )}
        </div>
      </div>
    </header>
  );
}
