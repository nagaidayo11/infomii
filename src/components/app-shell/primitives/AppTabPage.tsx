"use client";

import type { CSSProperties, ReactNode } from "react";

type AppTabPageProps = {
  title: string;
  description?: string;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
};

/** Shared shell for bottom-tab screens (home, templates, pages, plan). */
export function AppTabPage({
  title,
  description,
  headerAction,
  children,
  className = "",
  contentClassName = "",
  style,
}: AppTabPageProps) {
  return (
    <div
      className={`app-tab-page app-shell-page-enter mx-auto w-full max-w-lg ${className}`.trim()}
      style={style}
    >
      <header className="app-screen-header app-reveal app-reveal--visible relative z-30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[1.75rem] font-bold tracking-tight text-[var(--app-text)]">{title}</h1>
            {description ? (
              <p className="app-screen-header-desc mt-1 text-[0.9375rem] leading-relaxed text-[var(--app-text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {headerAction ? <div className="relative z-40 shrink-0">{headerAction}</div> : null}
        </div>
      </header>

      <div className={`app-tab-page-content relative z-0 ${contentClassName}`.trim()}>{children}</div>
    </div>
  );
}
