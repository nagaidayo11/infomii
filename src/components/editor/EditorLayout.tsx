"use client";

import type { ReactNode } from "react";

/**
 * Canvas-based card editor layout — Notion-like three panels.
 * Left: Card Library | Center: Canvas (375px mobile preview) | Right: Card Settings.
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
      aria-label="カードエディタ"
    >
      {/* Left: Card Library */}
      <aside
        data-editor-column="library"
        className="flex h-full w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white"
        aria-label="カードライブラリ"
      >
        {library}
      </aside>

      {/* Center: Canvas (mobile preview 375px) */}
      <section
        data-editor-column="canvas"
        className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-100"
        aria-label="キャンバス（モバイルプレビュー）"
      >
        {canvas}
      </section>

      {/* Right: Card Settings */}
      <aside
        data-editor-column="settings"
        className="flex h-full w-[320px] shrink-0 flex-col border-l border-slate-200 bg-white"
        aria-label="カード設定"
      >
        {settings}
      </aside>
    </div>
  );
}
