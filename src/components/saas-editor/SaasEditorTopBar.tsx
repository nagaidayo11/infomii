"use client";

import { motion } from "framer-motion";

type SaasEditorTopBarProps = {
  pageTitle: string;
  isSaving: boolean;
  lastSavedAt: number | null;
  onNewPage?: () => void;
  onPreview?: () => void;
};

export function SaasEditorTopBar({
  pageTitle,
  isSaving,
  lastSavedAt,
  onNewPage,
  onPreview,
}: SaasEditorTopBarProps) {
  const savedText =
    lastSavedAt != null
      ? new Date(lastSavedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }) + " に保存"
      : "未保存";

  return (
    <header className="shrink-0 border-b border-slate-200/60 bg-white/95 backdrop-blur-sm" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="flex h-16 items-center justify-between gap-6 px-6">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[16px] bg-slate-800 text-white" style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.15)" }}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-800">
              {pageTitle || "無題のページ"}
            </h1>
          </div>
          <motion.span
            key={isSaving ? "saving" : savedText}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-600"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          >
            {isSaving ? (
              <>
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                保存中…
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {savedText}
              </>
            )}
          </motion.span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="rounded-[16px] border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              プレビュー
            </button>
          )}
          {onNewPage && (
            <button
              type="button"
              onClick={onNewPage}
              className="rounded-[16px] bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.2)" }}
            >
              新規ページ
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
