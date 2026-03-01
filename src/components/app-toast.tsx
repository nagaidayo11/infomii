"use client";

import { ReactNode, useEffect } from "react";

type AppToastProps = {
  message: string;
  kind?: "success" | "error" | "info";
  onClose?: () => void;
  durationMs?: number;
  action?: ReactNode;
};

export default function AppToast({
  message,
  kind = "info",
  onClose,
  durationMs = 5000,
  action,
}: AppToastProps) {
  useEffect(() => {
    if (!onClose || durationMs <= 0) {
      return;
    }
    const timer = window.setTimeout(() => onClose(), durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onClose, message]);

  const toneClass =
    kind === "success"
      ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
      : kind === "error"
        ? "border-rose-200 bg-rose-50/95 text-rose-900"
        : "border-slate-200 bg-white/95 text-slate-900";

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50">
      <div className={`pointer-events-auto flex min-w-[260px] items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${toneClass}`}>
        <span className="mt-0.5 text-base leading-none">{kind === "success" ? "✓" : kind === "error" ? "!" : "i"}</span>
        <div className="min-w-0 flex-1">
          <p className="break-words">{message}</p>
          {action ? <div className="mt-2">{action}</div> : null}
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700 hover:bg-slate-50"
            aria-label="通知を閉じる"
          >
            閉じる
          </button>
        ) : null}
      </div>
    </div>
  );
}

