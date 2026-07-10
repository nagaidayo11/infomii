"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import type { EditorTopBarProps } from "@/components/editor/EditorTopBar";
import { AppShellLink } from "./AppShellLink";
import { AppBottomSheet } from "./primitives/AppBottomSheet";
import { AppSwitch } from "./primitives/AppSwitch";

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
  | "publishNotice"
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

function QrLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
      />
    </svg>
  );
}

function AppSheetSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="app-sheet-section">
      <p className="app-sheet-section-label">{label}</p>
      {children}
    </div>
  );
}

function saveHintKey(
  saveError: string | null | undefined,
  saving: boolean | undefined,
  lastSavedAt: number | null | undefined,
): string {
  if (saveError) return "error";
  if (saving) return "saving";
  if (lastSavedAt != null) return "saved";
  return "idle";
}

function saveHintText(
  saveError: string | null | undefined,
  saving: boolean | undefined,
  lastSavedAt: number | null | undefined,
): string {
  if (saveError) return "保存エラー";
  if (saving) return "保存中…";
  if (lastSavedAt != null) return "保存済み";
  return "未保存";
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
  publishNotice = null,
}: EditorAppTopBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const canTogglePublish = !demoMode && typeof onTogglePublished === "function";
  const showPublishActionButton =
    !demoMode && (!canTogglePublish || publishActionLabel !== "公開");

  const hintKey = saveHintKey(saveError, saving, lastSavedAt);
  const saveHint = saveHintText(saveError, saving, lastSavedAt);

  return (
    <header
      className="editor-app-topbar grid min-h-[52px] shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 border-b border-teal-700/20 bg-gradient-to-r from-teal-600 to-teal-500 px-1.5 pb-1.5 text-white shadow-sm"
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
        className="editor-topbar-btn editor-topbar-btn--round h-11 w-11 shrink-0"
        aria-label="ホームに戻る"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </AppShellLink>

      <div className="min-w-0 overflow-hidden px-0.5">
        <p className="truncate text-sm font-semibold leading-tight">{pageTitle || "編集中"}</p>
        <div className="editor-save-hint">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={hintKey}
              className="editor-save-hint-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.15 }}
            >
              {saveHint}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-1">
        {publishNotice === "unpublished_changes" ? (
          <span
            className="rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-bold text-amber-950 shadow-sm"
            title="未反映の変更があります。プレビュー・QR・公開更新で反映できます"
            role="status"
          >
            未反映
          </span>
        ) : null}
        {publishNotice === "draft_off" ? (
          <span
            className="rounded-full bg-amber-300/90 px-1.5 py-0.5 text-[10px] font-semibold text-amber-950"
            title="公開OFFです。ONにすると共有できます"
            role="status"
          >
            OFF
          </span>
        ) : null}
        {canTogglePublish ? (
          <AppSwitch
            variant="on-dark"
            compact
            label="公開"
            checked={publishToggleChecked}
            loading={publishToggleLoading}
            disabled={publishing}
            ariaLabel="ゲスト向けの公開"
            onCheckedChange={() => onTogglePublished?.()}
            className="min-h-0 max-w-[5.5rem] shrink-0"
          />
        ) : null}

        <button
          type="button"
          onClick={onQr}
          disabled={publishing || qrPreparing}
          className="editor-topbar-btn h-10 w-10 shrink-0"
          aria-label="QRとリンク"
        >
          {qrPreparing ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <QrLinkIcon className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          onClick={onPreview}
          disabled={!publicUrl || previewPreparing}
          className="editor-topbar-btn h-10 w-10 shrink-0"
          aria-label="プレビュー"
        >
          {previewPreparing ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <PreviewIcon className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="editor-topbar-btn h-10 w-10 shrink-0"
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          aria-label="その他の操作"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
          </svg>
        </button>
      </div>

      <AppBottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="その他の操作">
        {saveError ? (
          <div className="border-b border-[var(--app-border)] px-3 py-2 text-sm text-rose-600">
            {saveError}
            {onRetry ? (
              <button
                type="button"
                className="app-sheet-action app-sheet-action--primary mt-1 !min-h-[40px] !px-0"
                onClick={() => {
                  onRetry();
                  setMoreOpen(false);
                }}
              >
                再試行
              </button>
            ) : null}
          </div>
        ) : null}

        {showPublishActionButton ? (
          <AppSheetSection label="公開">
            <button
              type="button"
              role="menuitem"
              disabled={publishing || qrPreparing}
              className={
                "app-sheet-action app-sheet-action--primary" +
                (publishNotice === "unpublished_changes" ? " !bg-emerald-600 !text-white" : "")
              }
              onClick={() => {
                setMoreOpen(false);
                onPublish();
              }}
            >
              {publishing
                ? "処理中…"
                : publishNotice === "unpublished_changes"
                  ? `● ${publishActionLabel}`
                  : publishActionLabel}
            </button>
          </AppSheetSection>
        ) : null}

        {onRenamePageTitle || onBulkFont ? (
          <AppSheetSection label="ページ">
            {onRenamePageTitle ? (
              <button
                type="button"
                role="menuitem"
                className="app-sheet-action"
                onClick={() => {
                  setMoreOpen(false);
                  const next = window.prompt("ページ名", pageTitle ?? "");
                  if (next != null && next.trim()) void onRenamePageTitle(next.trim());
                }}
              >
                ページ名を変更
              </button>
            ) : null}
            {onBulkFont ? (
              <button
                type="button"
                role="menuitem"
                className="app-sheet-action"
                onClick={(e) => {
                  onBulkFont(e.currentTarget);
                  setMoreOpen(false);
                }}
              >
                一括フォント切替
              </button>
            ) : null}
          </AppSheetSection>
        ) : null}

        <AppSheetSection label="編集">
          <button
            type="button"
            role="menuitem"
            disabled={!canUndo || !onUndo}
            className="app-sheet-action"
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
            className="app-sheet-action"
            onClick={() => {
              onRedo?.();
              setMoreOpen(false);
            }}
          >
            やり直す
          </button>
        </AppSheetSection>

        {onClearAll ? (
          <AppSheetSection label="注意">
            <button
              type="button"
              role="menuitem"
              disabled={!canClearAll}
              className="app-sheet-action app-sheet-action--danger"
              onClick={() => {
                onClearAll();
                setMoreOpen(false);
              }}
            >
              ブロックをすべて削除
            </button>
          </AppSheetSection>
        ) : null}
      </AppBottomSheet>
    </header>
  );
}
