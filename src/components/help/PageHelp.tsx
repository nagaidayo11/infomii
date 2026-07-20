"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

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
}: PageHelpProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();
  const a11yLabel = label ?? `${title}の説明`;

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

  useEffect(() => {
    return () => clearHoverTimer();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

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
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="app-button-native inline-flex h-9 w-9 min-h-9 min-w-9 items-center justify-center rounded-full border border-[#e6e8eb] bg-white text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={a11yLabel}
        title={a11yLabel}
      >
        ?
      </button>
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={a11yLabel}
          className={
            "absolute top-full z-[80] mt-2 rounded-lg border border-[#e6e8eb] bg-white p-3.5 text-left shadow-lg " +
            (wide ? "w-[min(100vw-2rem,22rem)]" : "w-[min(100vw-2rem,20rem)]") +
            (align === "left" ? " left-0" : " right-0")
          }
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
      ) : null}
    </div>
  );
}
