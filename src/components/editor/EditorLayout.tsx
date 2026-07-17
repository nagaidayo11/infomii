"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppBottomSheet } from "@/components/app-shell/primitives/AppBottomSheet";

/**
 * Dedicated editor layout. Does not use DashboardLayout.
 * Desktop (`lg+`): TopBar + Card Library | Canvas | Card Settings.
 * Mobile: Canvas full width + in-flow bottom tabs + overlay sheets above the tab bar.
 */
export type EditorLayoutProps = {
  topBar?: ReactNode;
  library: ReactNode;
  canvas: ReactNode;
  settings: ReactNode;
  mobileActions?: ReactNode;
  /** モバイルシート開閉（キャンバス側のスクロール調整など） */
  onMobileSheetChange?: (sheet: MobileSheet) => void;
  /** Native app shell: Canva-style bottom tool labels */
  footerVariant?: "default" | "app";
};

type MobileSheet = "none" | "library" | "settings";
type MobileSheetSize = "compact" | "comfortable" | "full";

const MOBILE_SHEET_TOP_MAP_WEB: Record<MobileSheetSize, string> = {
  compact: "46dvh",
  comfortable: "32dvh",
  full: "3.5rem",
};

const MOBILE_SHEET_TOP_MAP_APP: Record<MobileSheetSize, string> = {
  compact: "46dvh",
  comfortable: "32dvh",
  full: "calc(3.25rem + env(safe-area-inset-top, 0px))",
};

const MOBILE_SHEET_LABEL: Record<MobileSheetSize, string> = {
  compact: "小",
  comfortable: "中",
  full: "全画面",
};

/** モバイル下部タブの高さ（シートの bottom オフセット用。実寸に合わせて px 指定） */
const MOBILE_NAV_HEIGHT =
  "calc(58px + env(safe-area-inset-bottom, 0px))";

const mobileSheetAsideClass =
  "ui-pop-in fixed inset-x-0 z-[90] flex max-h-[min(88dvh,calc(100dvh-10rem))] min-h-0 flex-col overflow-hidden rounded-t-lg border border-[#e6e8eb] bg-white shadow-md lg:static lg:z-auto lg:max-h-none lg:rounded-none lg:shadow-none";

export function EditorLayout({
  topBar,
  library,
  canvas,
  settings,
  mobileActions,
  onMobileSheetChange,
  footerVariant = "default",
}: EditorLayoutProps) {
  const isAppFooter = footerVariant === "app";
  const mobileSheetTopMap = isAppFooter ? MOBILE_SHEET_TOP_MAP_APP : MOBILE_SHEET_TOP_MAP_WEB;
  const libraryTabLabel = isAppFooter ? "ブロック" : "ブロック追加";
  const canvasTabLabel = isAppFooter ? "編集" : "キャンバス";
  const settingsTabLabel = isAppFooter ? "設定" : "ブロック設定";
  const [sheet, setSheet] = useState<MobileSheet>("none");
  const [mobileSheetSize, setMobileSheetSize] = useState<MobileSheetSize>("comfortable");
  const [dragTopPx, setDragTopPx] = useState<number | null>(null);
  const [dragState, setDragState] = useState<{
    startY: number;
    startTopPx: number;
    startSize: MobileSheetSize;
  } | null>(null);

  const getViewportHeight = () => (typeof window !== "undefined" ? window.innerHeight : 800);
  const editorTopChromePx = isAppFooter ? 88 : 56;

  const getSnapTopPx = (size: MobileSheetSize, viewportHeight: number) => {
    if (size === "full") return editorTopChromePx;
    if (size === "comfortable") return Math.max(56, Math.round(viewportHeight * 0.32));
    return Math.max(56, Math.round(viewportHeight * 0.46));
  };
  const closeTopPx = (viewportHeight: number) => Math.round(viewportHeight * 0.82);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const clear = () => {
      if (mq.matches) applySheet("none");
    };
    mq.addEventListener("change", clear);
    return () => mq.removeEventListener("change", clear);
  }, []);

  const applySheet = (next: MobileSheet) => {
    if (next === "library" || next === "settings") {
      setMobileSheetSize("comfortable");
      setDragTopPx(null);
    } else {
      setDragTopPx(null);
      setDragState(null);
    }
    setSheet(next);
    onMobileSheetChange?.(next);
  };

  const openLibrary = () => {
    applySheet(sheet === "library" ? "none" : "library");
  };
  const openSettings = () => {
    const next = sheet === "settings" ? "none" : "settings";
    if (next === "settings") {
      setMobileSheetSize("comfortable");
      setDragTopPx(null);
    }
    applySheet(next);
  };
  const focusCanvas = () => {
    applySheet("none");
  };

  const sheetOpen = sheet !== "none";

  useEffect(() => {
    if (!sheetOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [sheetOpen]);

  useEffect(() => {
    if (!dragState) return;
    const onMove = (event: PointerEvent) => {
      const viewportHeight = getViewportHeight();
      const minTop = getSnapTopPx("full", viewportHeight);
      const maxTop = Math.max(minTop + 24, viewportHeight - 120);
      const nextTop = Math.min(maxTop, Math.max(minTop, dragState.startTopPx + (event.clientY - dragState.startY)));
      setDragTopPx(nextTop);
    };

    const onUp = (event: PointerEvent) => {
      const viewportHeight = getViewportHeight();
      const minTop = getSnapTopPx("full", viewportHeight);
      const maxTop = Math.max(minTop + 24, viewportHeight - 120);
      const finalTop = Math.min(maxTop, Math.max(minTop, dragState.startTopPx + (event.clientY - dragState.startY)));
      if (finalTop >= closeTopPx(viewportHeight)) {
        applySheet("none");
        setMobileSheetSize("comfortable");
        return;
      }

      const candidates: Array<{ size: MobileSheetSize; top: number }> = [
        { size: "full", top: getSnapTopPx("full", viewportHeight) },
        { size: "comfortable", top: getSnapTopPx("comfortable", viewportHeight) },
        { size: "compact", top: getSnapTopPx("compact", viewportHeight) },
      ];
      const nearest = candidates.reduce((best, current) =>
        Math.abs(current.top - finalTop) < Math.abs(best.top - finalTop) ? current : best
      );
      setMobileSheetSize(nearest.size);
      setDragTopPx(finalTop);
      setDragState(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragState]);

  const startHandleDrag = (event: { clientY: number }) => {
    if (sheet === "none") return;
    const viewportHeight = getViewportHeight();
    const currentTop = dragTopPx ?? getSnapTopPx(mobileSheetSize, viewportHeight);
    setDragState({
      startY: event.clientY,
      startTopPx: currentTop,
      startSize: mobileSheetSize,
    });
  };

  return (
    <div
      className="app-ambient-bg flex h-[100dvh] max-lg:h-[100svh] w-full flex-col overflow-hidden bg-[#f6f8fa]"
      role="application"
      aria-label="エディタ"
      data-editor-layout
      style={{ ["--editor-mobile-nav-h" as string]: MOBILE_NAV_HEIGHT }}
    >
      {topBar != null ? (
        isAppFooter ? (
          <div className="relative z-[110] shrink-0" data-editor-topbar>
            {topBar}
          </div>
        ) : (
          <header
            className="app-page-enter relative z-[110] shrink-0 border-b border-slate-200/80 bg-white"
            role="banner"
            data-editor-topbar
          >
            {topBar}
          </header>
        )
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        {sheetOpen && !isAppFooter ? (
          <button
            type="button"
            className="absolute inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] transition-opacity lg:hidden"
            aria-label="パネルを閉じる"
            onClick={() => applySheet("none")}
          />
        ) : null}

        <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row" role="main">
          <aside
            data-editor-column="library"
            className={
              isAppFooter
                ? "app-page-enter hidden min-h-0 shrink-0 flex-col overflow-hidden overscroll-contain border-[#e6e8eb] bg-white lg:flex lg:static lg:z-auto lg:h-full lg:w-[300px] lg:border-r"
                : "app-page-enter flex min-h-0 shrink-0 flex-col overflow-hidden overscroll-contain border-[#e6e8eb] bg-white " +
                  "lg:static lg:z-auto lg:h-full lg:w-[300px] lg:border-r " +
                  (sheet === "library" ? mobileSheetAsideClass : "hidden lg:flex lg:h-full lg:w-[300px] lg:border-r")
            }
            style={
              isAppFooter
                ? { animationDelay: "40ms" }
                : {
                    animationDelay: "40ms",
                    bottom: sheet === "library" ? MOBILE_NAV_HEIGHT : undefined,
                    top:
                      sheet === "library"
                        ? dragTopPx != null
                          ? `${dragTopPx}px`
                          : `max(3.5rem, ${mobileSheetTopMap[mobileSheetSize]})`
                        : undefined,
                  }
            }
            aria-label="ブロックライブラリ"
          >
            {!isAppFooter && sheet === "library" ? (
              <div
                className="shrink-0 border-b border-slate-100 bg-white px-3 py-1.5 lg:hidden touch-none"
                onPointerDown={startHandleDrag}
                role="presentation"
                aria-label={`パネルハンドル（現在: ${MOBILE_SHEET_LABEL[mobileSheetSize]}）`}
              >
                <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300" aria-hidden />
              </div>
            ) : null}
            {library}
          </aside>

          <section
            data-editor-column="canvas"
            className="app-page-atmosphere app-page-enter flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overscroll-contain bg-[#f6f8fa]"
            aria-label="キャンバス"
            style={{ animationDelay: "90ms" }}
          >
            {canvas}
          </section>

          <aside
            data-editor-column="settings"
            className={
              isAppFooter
                ? "app-page-enter hidden min-h-0 shrink-0 flex-col overflow-hidden overscroll-contain border-[#e6e8eb] bg-white lg:flex lg:static lg:z-auto lg:h-full lg:w-[360px] lg:border-l xl:w-[380px]"
                : "app-page-enter flex min-h-0 shrink-0 flex-col overflow-hidden overscroll-contain border-[#e6e8eb] bg-white " +
                  "lg:static lg:z-auto lg:h-full lg:w-[360px] lg:border-l xl:w-[380px] " +
                  (sheet === "settings" ? mobileSheetAsideClass : "hidden lg:flex lg:h-full lg:w-[360px] lg:border-l xl:w-[380px]")
            }
            style={
              isAppFooter
                ? { animationDelay: "140ms" }
                : {
                    animationDelay: "140ms",
                    bottom: sheet === "settings" ? MOBILE_NAV_HEIGHT : undefined,
                    top:
                      sheet === "settings"
                        ? dragTopPx != null
                          ? `${dragTopPx}px`
                          : `max(3.5rem, ${mobileSheetTopMap[mobileSheetSize]})`
                        : undefined,
                  }
            }
            aria-label="ブロック設定"
          >
            {!isAppFooter && sheet === "settings" ? (
              <div
                className="shrink-0 border-b border-slate-100 bg-white px-3 py-1.5 lg:hidden touch-none"
                onPointerDown={startHandleDrag}
                role="presentation"
                aria-label={`パネルハンドル（現在: ${MOBILE_SHEET_LABEL[mobileSheetSize]}）`}
              >
                <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-300" aria-hidden />
              </div>
            ) : null}
            {settings}
          </aside>
        </div>
      </div>

      <div className="relative z-[100] shrink-0 lg:hidden">
        {mobileActions != null && !sheetOpen ? (
          <div className="border-t border-slate-200/80 bg-white px-2 py-2">
            <div className="mx-auto max-w-2xl rounded-xl border border-slate-200/90 bg-white p-2 shadow-sm">
              {mobileActions}
            </div>
          </div>
        ) : null}
        <nav
          className={
            "flex border-t px-1 pt-1 shadow-[0_-4px_12px_rgba(15,23,42,0.1)] " +
            (isAppFooter ? "border-slate-200/80 bg-slate-50" : "border-slate-200 bg-white")
          }
          style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
          aria-label="エディタ操作"
        >
          <button
            type="button"
            onClick={openLibrary}
            aria-label="ブロック一覧を開く"
            className={
              "ui-pop-tap flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 font-semibold transition-colors " +
              (isAppFooter ? "min-h-[52px] text-xs" : "min-h-[50px] text-[11px]") +
              " " +
              (sheet === "library"
                ? "text-slate-900"
                : "text-slate-500 active:bg-slate-100 lg:hover:bg-slate-50 lg:hover:text-slate-800")
            }
          >
            {isAppFooter ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
            {libraryTabLabel}
          </button>
          <button
            type="button"
            onClick={focusCanvas}
            aria-label="キャンバスを表示"
            className={
              "ui-pop-tap flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 font-semibold transition-colors " +
              (isAppFooter ? "min-h-[52px] text-xs" : "min-h-[50px] text-[11px]") +
              " " +
              (sheet === "none"
                ? "text-slate-900"
                : "text-slate-500 active:bg-slate-100 lg:hover:bg-slate-50 lg:hover:text-slate-800")
            }
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {canvasTabLabel}
          </button>
          <button
            type="button"
            onClick={openSettings}
            aria-label="ブロック設定を開く"
            className={
              "ui-pop-tap flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 font-semibold transition-colors " +
              (isAppFooter ? "min-h-[52px] text-xs" : "min-h-[50px] text-[11px]") +
              " " +
              (sheet === "settings"
                ? "text-slate-900"
                : "text-slate-500 active:bg-slate-100 lg:hover:bg-slate-50 lg:hover:text-slate-800")
            }
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2m4 0V4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16v-2a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
            </svg>
            {settingsTabLabel}
          </button>
        </nav>
      </div>

      {isAppFooter ? (
        <>
          <AppBottomSheet
            open={sheet === "library"}
            title="ブロック"
            onClose={() => applySheet("none")}
            size={mobileSheetSize}
            panelClassName="app-bottom-sheet-panel--editor"
            headerTrailing={
              <div className="flex items-center gap-1" role="group" aria-label="シートの高さ">
                {(["compact", "comfortable", "full"] as MobileSheetSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={
                      "app-bottom-sheet-size-chip ui-pop-tap" +
                      (mobileSheetSize === size ? " app-bottom-sheet-size-chip--active" : "")
                    }
                    aria-pressed={mobileSheetSize === size}
                    onClick={() => setMobileSheetSize(size)}
                  >
                    {MOBILE_SHEET_LABEL[size]}
                  </button>
                ))}
              </div>
            }
          >
            {library}
          </AppBottomSheet>
          <AppBottomSheet
            open={sheet === "settings"}
            title="設定"
            onClose={() => applySheet("none")}
            size={mobileSheetSize}
            panelClassName="app-bottom-sheet-panel--editor"
            headerTrailing={
              <div className="flex items-center gap-1" role="group" aria-label="シートの高さ">
                {(["compact", "comfortable", "full"] as MobileSheetSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={
                      "app-bottom-sheet-size-chip ui-pop-tap" +
                      (mobileSheetSize === size ? " app-bottom-sheet-size-chip--active" : "")
                    }
                    aria-pressed={mobileSheetSize === size}
                    onClick={() => setMobileSheetSize(size)}
                  >
                    {MOBILE_SHEET_LABEL[size]}
                  </button>
                ))}
              </div>
            }
          >
            {settings}
          </AppBottomSheet>
        </>
      ) : null}
    </div>
  );
}
