"use client";

import type { ReactNode } from "react";

/**
 * 3-column editor layout: Card library (left) | Live preview (center) | Card settings (right).
 * Modern SaaS UI: rounded cards, soft shadows, clean layout.
 */
type EditorLayoutProps = {
  /** Left column: card library for adding cards */
  library: ReactNode;
  /** Center column: live page preview (e.g. 375px mobile frame) */
  preview: ReactNode;
  /** Right column: card settings panel */
  settings: ReactNode;
};

export function EditorLayout({ library, preview, settings }: EditorLayoutProps) {
  return (
    <div
      className="flex h-[100vh] min-h-[640px] w-full overflow-hidden bg-ds-bg"
      role="application"
      aria-label="ページエディタ"
      data-editor-layout="3col"
    >
      <div data-editor-column="library" className="shrink-0">
        {library}
      </div>
      <div data-editor-column="preview" className="flex min-w-0 flex-1 flex-col">
        {preview}
      </div>
      <div data-editor-column="settings" className="shrink-0">
        {settings}
      </div>
    </div>
  );
}
