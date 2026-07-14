"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

/** Editor / guest mock screen width. */
export const PHONE_SCREEN_WIDTH = 350;
const BEZEL_PX = 10;

type PhoneDeviceFrameProps = {
  children: ReactNode;
  /** Optional header chrome (e.g. guest hamburger) pinned above scroll area */
  header?: ReactNode;
  /** Optional footer chrome (e.g. guest bottom tabs) pinned below scroll area */
  footer?: ReactNode;
  /** Screen content width in CSS px (default 400). */
  width?: number;
  className?: string;
  /**
   * Stretch the chassis toward the parent height, leaving vertical breathing room
   * (`verticalInset`) so the mock is not flush with the canvas edges.
   */
  fillHeight?: boolean;
  /** Top/bottom inset around the mock when fillHeight is true (px). Default 28. */
  verticalInset?: number;
  /** Show Dynamic Island notch. Default true. */
  showNotch?: boolean;
  /** Screen background */
  screenStyle?: CSSProperties;
  /**
   * When true (default), children scroll inside the screen and `footer` stays pinned.
   * When false, children fill the screen as a flex column (caller manages scroll).
   */
  manageScroll?: boolean;
  /** Notify parent of the fixed screen width (for editor card layout). */
  onScreenWidthChange?: (screenWidthPx: number) => void;
};

/**
 * iPhone-style device chassis.
 * Width is fixed (default 400). With fillHeight, the frame uses the parent
 * height minus vertical inset so the mock has top/bottom breathing room.
 */
export function PhoneDeviceFrame({
  children,
  header,
  footer,
  width = PHONE_SCREEN_WIDTH,
  className = "",
  fillHeight = true,
  verticalInset = 28,
  showNotch = true,
  screenStyle,
  manageScroll = true,
  onScreenWidthChange,
}: PhoneDeviceFrameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const outerW = width + BEZEL_PX * 2;
  const inset = Math.max(0, verticalInset);

  useEffect(() => {
    onScreenWidthChange?.(width);
  }, [width, onScreenWidthChange]);

  return (
    <div
      ref={hostRef}
      className={
        "flex justify-center " +
        (fillHeight ? "h-full min-h-0 w-full items-center " : "items-start ") +
        className
      }
      aria-label="スマートフォンプレビュー"
    >
      <div
        className="relative flex min-h-0 shrink-0 flex-col overflow-hidden rounded-[2.4rem] border-[10px] border-stone-900 bg-stone-900"
        style={{
          width: outerW,
          maxWidth: "100%",
          height: fillHeight ? `calc(100% - ${inset * 2}px)` : undefined,
          maxHeight: fillHeight ? `calc(100% - ${inset * 2}px)` : undefined,
          boxShadow:
            "0 22px 48px -14px rgba(15,23,42,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {showNotch ? (
          <div
            className="pointer-events-none absolute left-1/2 top-2.5 z-30 h-7 w-[108px] -translate-x-1/2 rounded-full bg-stone-950 shadow-inner"
            aria-hidden
          />
        ) : null}

        <div
          className={
            "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.55rem] bg-white " +
            (showNotch ? "pt-9" : "pt-1")
          }
          style={screenStyle}
          data-phone-screen
        >
          {manageScroll ? (
            <>
              {header ? (
                <div
                  className="guest-header-chrome relative z-[90] shrink-0 border-b border-slate-100 bg-white/95 px-3 py-2.5"
                  data-guest-header
                >
                  {header}
                </div>
              ) : null}
              <div
                className="template-preview-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {children}
              </div>
              {footer ? (
                <div className="guest-bottom-chrome shrink-0 z-20 bg-white">{footer}</div>
              ) : null}
            </>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {header ? (
                <div
                  className="guest-header-chrome relative z-[90] shrink-0 border-b border-slate-100 bg-white/95 px-3 py-2.5"
                  data-guest-header
                >
                  {header}
                </div>
              ) : null}
              <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
              {footer ? (
                <div className="guest-bottom-chrome shrink-0 z-20 bg-white">{footer}</div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
