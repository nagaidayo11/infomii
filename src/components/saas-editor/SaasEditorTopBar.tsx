"use client";

import { motion } from "framer-motion";

type SaasEditorTopBarProps = {
  pageTitle: string;
  isSaving: boolean;
  lastSavedAt: number | null;
  onNewPage?: () => void;
};

export function SaasEditorTopBar({
  pageTitle,
  isSaving,
  lastSavedAt,
  onNewPage,
}: SaasEditorTopBarProps) {
  const savedText =
    lastSavedAt != null
      ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
      : "Unsaved";

  return (
    <div className="flex h-12 items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-slate-800 truncate max-w-[200px]">
          {pageTitle}
        </h1>
        <motion.span
          className="text-xs text-slate-500"
          key={isSaving ? "saving" : savedText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {isSaving ? "Saving…" : savedText}
        </motion.span>
      </div>
      <div className="flex items-center gap-2">
        {onNewPage && (
          <button
            type="button"
            onClick={onNewPage}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            New page
          </button>
        )}
      </div>
    </div>
  );
}
