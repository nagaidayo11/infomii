"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SupportedLocale } from "@/lib/localized-content";

type GuestLanguageToggleProps = {
  locale: SupportedLocale;
  onLocaleChange: (locale: SupportedLocale) => void;
  /** Optional toast when the menu opens or a language is chosen */
  onHint?: () => void;
  /**
   * Kept for callers in phone mocks. Dropdown is anchored under the toggle
   * inside the header stack (no full-screen sheet), so clipping is avoided
   * without a portal.
   */
  contained?: boolean;
  className?: string;
};

const LOCALES: Array<{ code: SupportedLocale; label: string }> = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" },
];

const MENU_ANIM_MS = 160;

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5 0 4.5-4 4.5-9S14.5 3 12 3 7.5 7 7.5 12s2 9 4.5 9zm-7.5-9h15"
      />
    </svg>
  );
}

function menuCopy(locale: SupportedLocale) {
  if (locale === "ko") return { list: "언어", close: "닫기" };
  if (locale === "zh") return { list: "语言", close: "关闭" };
  if (locale === "en") return { list: "Language", close: "Close" };
  return { list: "言語", close: "閉じる" };
}

/**
 * Header Language control: compact button + dropdown list anchored under the toggle.
 */
export function GuestLanguageToggle({
  locale,
  onLocaleChange,
  onHint,
  contained: _contained = false,
  className = "",
}: GuestLanguageToggleProps) {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const copy = menuCopy(locale);

  function openMenu() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMounted(true);
    onHint?.();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
  }

  function closeMenu() {
    setEntered(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setMounted(false);
      closeTimerRef.current = null;
    }, MENU_ANIM_MS);
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        closeMenu();
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mounted]);

  return (
    <div ref={rootRef} className={"relative " + className}>
      <button
        type="button"
        onClick={() => (mounted ? closeMenu() : openMenu())}
        className="ui-pop-tap inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-[12px] font-medium text-slate-600 transition hover:text-slate-900"
        aria-label="Language"
        aria-expanded={entered}
        aria-haspopup="listbox"
        aria-controls={mounted ? listId : undefined}
      >
        <GlobeIcon className="h-4 w-4" />
        <span>Language</span>
      </button>

      {mounted ? (
        <div
          id={listId}
          role="listbox"
          aria-label={copy.list}
          className={
            "absolute right-0 top-[calc(100%+4px)] z-[100] min-w-[8.5rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-[0_8px_24px_rgba(15,23,42,0.14)] " +
            "origin-top transition-[opacity,transform] duration-150 ease-out will-change-transform " +
            (entered ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0")
          }
        >
          {LOCALES.map((item) => {
            const active = locale === item.code;
            return (
              <button
                key={item.code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onLocaleChange(item.code);
                  onHint?.();
                  closeMenu();
                }}
                className={
                  "ui-pop-tap flex w-full items-center px-3 py-1.5 text-left text-[13px] font-medium transition " +
                  (active
                    ? "bg-[#2D7078] !text-white"
                    : "text-slate-800 hover:bg-slate-50")
                }
                style={active ? { color: "#ffffff" } : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
