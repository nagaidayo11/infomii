"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Dedicated editor layout. Does not use DashboardLayout.
 * Desktop (`lg+`): TopBar + Card Library | Canvas | Card Settings.
 * Mobile: Canvas full width + bottom tabs to open library/settings as bottom sheets.
 */
export type EditorLayoutProps = {
  topBar?: ReactNode;
  library: ReactNode;
  canvas: ReactNode;
  settings: ReactNode;
};

type MobileSheet = "none" | "library" | "settings";

export function EditorLayout({ topBar, library, canvas, settings }: EditorLayoutProps) {
  const [sheet, setSheet] = useState<MobileSheet>("none");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const clear = () => {
      if (mq.matches) setSheet("none");
    };
    mq.addEventListener("change", clear);
    return () => mq.removeEventListener("change", clear);
  }, []);

  const openLibrary = () => setSheet((s) => (s === "library" ? "none" : "library"));
  const openSettings = () => setSheet((s) => (s === "settings" ? "none" : "settings"));
  const focusCanvas = () => setSheet("none");

  const sheetOpen = sheet !== "none";

  return (
    <div
      className="app-ambient-bg flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-100/95"
      role="application"
      aria-label="エディタ"
      data-editor-layout
    >
      {topBar != null ? (
        <header
          className="app-page-enter shrink-0 border-b border-slate-200/80 bg-white"
          role="banner"
          data-editor-topbar
        >
          {topBar}
        </header>
      ) : null}

      {/* Mobile: backdrop */}
      {sheetOpen && (
        <button
          type="button"
          className="fixed left-0 right-0 top-12 z-40 bg-slate-900/45 lg:hidden"
          style={{
            bottom: "calc(3.65rem + env(safe-area-inset-bottom, 0px))",
          }}
          aria-label="パネルを閉じる"
          onClick={() => setSheet("none")}
        />
      )}

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row" role="main">
        {/* Library — desktop fixed width; mobile bottom sheet */}
        <aside
          data-editor-column="library"
          className={
            "app-page-enter flex min-h-0 shrink-0 flex-col overflow-hidden border-slate-200/90 bg-white shadow-sm " +
            "lg:static lg:z-auto lg:h-full lg:w-[280px] lg:border-r " +
            (sheet === "library"
              ? "fixed inset-x-0 bottom-0 top-12 z-50 max-h-[min(90dvh,calc(100dvh-3rem))] rounded-t-2xl border border-slate-200 shadow-2xl lg:rounded-none lg:shadow-sm"
              : "hidden lg:flex")
          }
          style={{ animationDelay: "40ms" }}
          aria-label="ブロックライブラリ"
        >
          {library}
        </aside>

        <section
          data-editor-column="canvas"
          className={
            "app-page-enter flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-100 " +
            "pb-[calc(3.75rem+env(safe-area-inset-bottom))] lg:pb-0"
          }
          aria-label="キャンバス"
          style={{ animationDelay: "90ms" }}
        >
          {canvas}
        </section>

        <aside
          data-editor-column="settings"
          className={
            "app-page-enter flex min-h-0 shrink-0 flex-col overflow-hidden border-slate-200/90 bg-white shadow-sm " +
            "lg:static lg:z-auto lg:h-full lg:w-[320px] lg:border-l " +
            (sheet === "settings"
              ? "fixed inset-x-0 bottom-0 top-12 z-50 max-h-[min(90dvh,calc(100dvh-3rem))] rounded-t-2xl border border-slate-200 shadow-2xl lg:rounded-none lg:shadow-sm"
              : "hidden lg:flex")
          }
          style={{ animationDelay: "140ms" }}
          aria-label="ブロック設定"
        >
          {settings}
        </aside>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200/90 bg-white/95 px-1 pt-1 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
        aria-label="エディタ表示"
      >
        <button
          type="button"
          onClick={openLibrary}
          className={
            "flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors " +
            (sheet === "library"
              ? "text-slate-900"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")
          }
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          ブロック
        </button>
        <button
          type="button"
          onClick={focusCanvas}
          className={
            "flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors " +
            (sheet === "none"
              ? "text-slate-900"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")
          }
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          キャンバス
        </button>
        <button
          type="button"
          onClick={openSettings}
          className={
            "flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition-colors " +
            (sheet === "settings"
              ? "text-slate-900"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")
          }
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2m4 0V4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16v-2a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
          </svg>
          設定
        </button>
      </nav>
    </div>
  );
}
