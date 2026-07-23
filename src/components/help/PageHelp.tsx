"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type PageHelpProps = {
  title: string;
  /** Short lead under the title */
  description?: string;
  /** Bullet tips (preferred for short how-to copy) */
  items?: string[];
  /** Rich body when bullets are not enough */
  children?: ReactNode;
  /** Accessible name for the ? button / dialog */
  label?: string;
  className?: string;
  /** Wider panel when content needs more room */
  wide?: boolean;
  /** Panel horizontal alignment relative to the button */
  align?: "left" | "right";
  /** Compact ? for form field labels */
  size?: "sm" | "md";
};

type PanelCoords = {
  top: number;
  left: number;
  width: number;
};

/**
 * Shared in-page help (?). Use on screen headers in place of a full manual.
 */
export function PageHelp({
  title,
  description,
  items,
  children,
  label,
  className = "",
  wide = false,
  align = "right",
  size = "md",
}: PageHelpProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<PanelCoords | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();
  const a11yLabel = label ?? `${title}の説明`;
  const panelWidth = wide ? 352 : 320;

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const openPanel = () => {
    clearHoverTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => setOpen(false), 120);
  };

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const margin = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(panelWidth, viewportWidth - margin * 2);

    let left = align === "left" ? rect.left : rect.right - width;
    left = Math.max(margin, Math.min(left, viewportWidth - width - margin));

    const panelHeight = panelRef.current?.offsetHeight ?? 220;
    let top = rect.bottom + 8;
    if (top + panelHeight > viewportHeight - margin) {
      top = Math.max(margin, rect.top - panelHeight - 8);
    }

    setCoords({ top, left, width });
  }, [align, panelWidth]);

  useEffect(() => {
    setMounted(true);
    return () => clearHoverTimer();
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updatePosition();
    const frame = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(frame);
  }, [open, title, description, items, children, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onReposition = () => updatePosition();

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, updatePosition]);

  const panel = open ? (
    <div
      id={panelId}
      ref={panelRef}
      role="dialog"
      aria-label={a11yLabel}
      style={
        coords
          ? { top: coords.top, left: coords.left, width: coords.width }
          : { visibility: "hidden", top: 0, left: 0, width: panelWidth }
      }
      className="fixed z-[200] rounded-lg border border-[#e6e8eb] bg-white p-3.5 text-left shadow-lg"
      onMouseEnter={openPanel}
      onMouseLeave={scheduleClose}
    >
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
      {items && items.length > 0 ? (
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {children ? <div className={items && items.length > 0 ? "mt-3" : "mt-2"}>{children}</div> : null}
    </div>
  ) : null;

  return (
    <div
      ref={rootRef}
      className={"relative z-40 inline-flex " + className}
      onMouseEnter={() => {
        clearHoverTimer();
        hoverTimerRef.current = setTimeout(openPanel, 160);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => openPanel()}
      onBlur={(event) => {
        if (rootRef.current?.contains(event.relatedTarget as Node)) return;
        setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          size === "sm"
            ? "app-button-native inline-flex h-5 w-5 min-h-5 min-w-5 items-center justify-center rounded-full border border-[#e6e8eb] bg-white text-[11px] font-semibold leading-none text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            : "app-button-native inline-flex h-9 w-9 min-h-9 min-w-9 items-center justify-center rounded-full border border-[#e6e8eb] bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        }
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={a11yLabel}
        title={a11yLabel}
      >
        ?
      </button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
