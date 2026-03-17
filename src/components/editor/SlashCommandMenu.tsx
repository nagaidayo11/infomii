"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CARD_ICONS } from "./CardLibrary";
import type { CardType } from "./types";

/** All card types available in slash menu — matches library order (Basic, Info, Actions, Media, Hospitality, then text/gallery/divider). */
const SLASH_MENU_ITEMS: Array<{ type: CardType; label: string }> = [
  { type: "hero", label: "ヒーロー" },
  { type: "info", label: "情報" },
  { type: "highlight", label: "ハイライト" },
  { type: "action", label: "アクション" },
  { type: "welcome", label: "Welcome" },
  { type: "wifi", label: "WiFi" },
  { type: "breakfast", label: "Breakfast" },
  { type: "checkout", label: "Checkout" },
  { type: "notice", label: "Notice" },
  { type: "nearby", label: "Nearby" },
  { type: "map", label: "Map" },
  { type: "emergency", label: "Emergency" },
  { type: "faq", label: "FAQ" },
  { type: "button", label: "Button" },
  { type: "taxi", label: "Taxi" },
  { type: "image", label: "Image" },
  { type: "restaurant", label: "Restaurant" },
  { type: "spa", label: "Spa" },
  { type: "laundry", label: "Laundry" },
  { type: "text", label: "Text" },
  { type: "gallery", label: "Gallery" },
  { type: "divider", label: "Divider" },
];

type SlashCommandMenuProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (type: CardType) => void;
  /** Optional anchor element to position the menu below (e.g. canvas). */
  anchorRef?: React.RefObject<HTMLElement | null>;
};

export function SlashCommandMenu({
  open,
  onClose,
  onSelect,
  anchorRef,
}: SlashCommandMenuProps) {
  const [highlightIndex, setHighlightIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const items = SLASH_MENU_ITEMS;

  useEffect(() => {
    if (!open) return;
    setHighlightIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((i) => (i + 1) % items.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((i) => (i - 1 + items.length) % items.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = items[highlightIndex];
        if (item) {
          onSelect(item.type);
          onClose();
        }
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, onSelect, highlightIndex, items]);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !open) return;
    const row = el.children[highlightIndex] as HTMLElement | undefined;
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightIndex, open]);

  if (!open || typeof document === "undefined") return null;

  const menu = (
    <div
      role="dialog"
      aria-label="カードを挿入"
      className="z-50 w-[320px] rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      style={getMenuStyle(anchorRef)}
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quick insert</p>
        <p className="mt-1 text-xs text-slate-500">Type <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono text-[10px]">/</kbd> in the canvas · Choose a card</p>
      </div>
      <div
        ref={listRef}
        className="max-h-[min(60vh,400px)] overflow-y-auto p-2"
      >
        {items.map((item, i) => (
          <button
            key={item.type}
            type="button"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
              i === highlightIndex
                ? "bg-blue-50 text-slate-900"
                : "text-slate-700 hover:bg-slate-50"
            }`}
            onMouseEnter={() => setHighlightIndex(i)}
            onClick={() => {
              onSelect(item.type);
              onClose();
            }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm">
              {CARD_ICONS[item.type] ?? CARD_ICONS.text}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const overlay = (
    <div
      className="fixed inset-0 z-40 bg-transparent"
      aria-hidden
      onClick={onClose}
    />
  );

  return createPortal(
    <>
      {overlay}
      {menu}
    </>,
    document.body
  );
}

function getMenuStyle(anchorRef?: React.RefObject<HTMLElement | null>): React.CSSProperties {
  if (anchorRef?.current) {
    const rect = anchorRef.current.getBoundingClientRect();
    return {
      position: "fixed",
      left: rect.left + rect.width / 2,
      top: Math.min(rect.top + rect.height + 8, window.innerHeight - 420),
      transform: "translateX(-50%)",
    };
  }
  return {
    position: "fixed",
    left: "50%",
    top: 120,
    transform: "translateX(-50%)",
  };
}
