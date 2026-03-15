"use client";

import type { ReactNode } from "react";

/**
 * Infomii Editor 2.0 — 3-column layout.
 * Left: Card library | Center: Mobile preview canvas (375px) | Right: Card settings.
 * Design: rounded-xl, soft shadows, clean spacing (Linear / Notion / Stripe).
 */
type EditorLayoutProps = {
  library: ReactNode;
  canvas: ReactNode;
  settings: ReactNode;
};

export function EditorLayout({ library, canvas, settings }: EditorLayoutProps) {
  return (
    <div
      className="flex h-full min-h-[640px] w-full overflow-hidden bg-slate-100"
      role="application"
      aria-label="ページエディタ"
      data-editor-version="2"
    >
      {/* Left: Card library */}
      <aside
        data-editor-column="library"
        className="flex h-full w-[280px] shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        {library}
      </aside>

      {/* Center: Mobile preview canvas (375px) */}
      <section
        data-editor-column="canvas"
        className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-100"
      >
        {canvas}
      </section>

      {/* Right: Card settings */}
      <aside
        data-editor-column="settings"
        className="flex h-full w-[320px] shrink-0 flex-col border-l border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        {settings}
      </aside>
    </div>
  );
}
