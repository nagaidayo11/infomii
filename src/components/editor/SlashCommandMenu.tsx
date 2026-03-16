"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CARD_ICONS } from "./CardLibrary";
import { CARD_LIBRARY_ITEMS, type CardType } from "./types";

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

  const items = CARD_LIBRARY_ITEMS;

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
      <div className="border-b border-slate-100 px-3 py-2">
        <p className="text-xs font-medium text-slate-500">/ でカードを挿入</p>
      </div>
      <div
        ref={listRef}
        className="max-h-[min(60vh,400px)] overflow-y-auto p-2"
      >
        {items.map((item, i) => (
          <button
            key={item.type}
            type="button"
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
              i === highlightIndex
                ? "bg-slate-100 text-slate-900"
                : "text-slate-700 hover:bg-slate-50"
            }`}
            onMouseEnter={() => setHighlightIndex(i)}
            onClick={() => {
              onSelect(item.type);
              onClose();
            }}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              {CARD_ICONS[item.type]}
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="block text-xs text-slate-500">{item.description}</span>
            </div>
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
