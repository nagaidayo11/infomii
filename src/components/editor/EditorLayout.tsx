"use client";

import type { ReactNode } from "react";

/**
 * Dedicated editor layout. Does not use DashboardLayout.
 * Full-viewport, distraction-free: TopBar + Card Library | Canvas | Card Settings.
 *
 * Structure:
 *   EditorLayout
 *    ├ EditorTopBar
 *    ├ CardLibrary (left)
 *    ├ Canvas (center)
 *    └ CardSettings (right)
 */
export type EditorLayoutProps = {
  /** Full-width top bar (back, title, save status, preview, publish) */
  topBar?: ReactNode;
  /** Left panel: card library for adding cards */
  library: ReactNode;
  /** Center panel: canvas (mobile preview) */
  canvas: ReactNode;
  /** Right panel: card settings */
  settings: ReactNode;
};

export function EditorLayout({ topBar, library, canvas, settings }: EditorLayoutProps) {
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-slate-100"
      role="application"
      aria-label="エディタ"
      data-editor-layout
    >
      {/* EditorTopBar — full width */}
      {topBar != null ? (
        <header
          className="shrink-0 border-b border-slate-200/80 bg-white"
          role="banner"
          data-editor-topbar
        >
          {topBar}
        </header>
      ) : null}

      {/* Three panels: Card Library (280px) | Canvas | Card Settings (320px). Consistent border and bg. */}
      <div className="flex min-h-0 flex-1" role="main">
        <aside
          data-editor-column="library"
          className="flex h-full w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white"
          aria-label="カードライブラリ"
        >
          {library}
        </aside>

        <section
          data-editor-column="canvas"
          className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-100"
          aria-label="キャンバス"
        >
          {canvas}
        </section>

        <aside
          data-editor-column="settings"
          className="flex h-full w-[320px] shrink-0 flex-col border-l border-slate-200 bg-white"
          aria-label="カード設定"
        >
          {settings}
        </aside>
      </div>
    </div>
  );
}
