"use client";

import type { ReactNode } from "react";

/**
 * Infomii Editor 2.0 — 3-column layout.
 * Left: Card Library | Center: Live Page Canvas | Right: Card Settings Panel.
 * Modern SaaS UI: rounded-xl, soft shadows, clean spacing.
 */
type EditorLayoutProps = {
  library: ReactNode;
  canvas: ReactNode;
  settings: ReactNode;
};

export function EditorLayout({ library, canvas, settings }: EditorLayoutProps) {
  return (
    <div
      className="flex h-[100vh] min-h-[640px] w-full overflow-hidden bg-ds-bg"
      role="application"
      aria-label="ページエディタ"
      data-editor-version="2"
    >
      <aside
        data-editor-column="library"
        className="flex h-full w-[280px] shrink-0 flex-col border-r border-ds-border bg-ds-bg"
      >
        {library}
      </aside>
      <section
        data-editor-column="canvas"
        className="flex min-w-0 flex-1 flex-col overflow-hidden bg-ds-bg"
      >
        {canvas}
      </section>
      <aside
        data-editor-column="settings"
        className="flex h-full w-[320px] shrink-0 flex-col border-l border-ds-border bg-ds-bg"
      >
        {settings}
      </aside>
    </div>
  );
}
