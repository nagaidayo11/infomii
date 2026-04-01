"use client";

import type { ReactNode } from "react";

type FullScreenLoadingOverlayProps = {
  title: string;
  subtitle?: ReactNode;
  /** Tailwind z-index class (e.g. z-[100]) */
  classNameZ?: string;
  /** When true, clicks pass through the backdrop */
  pointerEventsNone?: boolean;
};

/**
 * Full-viewport loading overlay — same visual weight as editor publish flow.
 */
export function FullScreenLoadingOverlay({
  title,
  subtitle,
  classNameZ = "z-[100]",
  pointerEventsNone = false,
}: FullScreenLoadingOverlayProps) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-slate-900/45 ${classNameZ} ${
        pointerEventsNone ? "pointer-events-none" : ""
      }`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="rounded-2xl border border-white/40 bg-slate-900/80 px-10 py-8 text-center shadow-2xl backdrop-blur-sm">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        <p className="mt-4 text-3xl font-bold tracking-wide text-white">{title}</p>
        {subtitle ? <p className="mt-2 text-sm font-medium text-slate-200">{subtitle}</p> : null}
      </div>
    </div>
  );
}
