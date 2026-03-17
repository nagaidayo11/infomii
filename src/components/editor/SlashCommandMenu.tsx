"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { CARD_ICONS, LIBRARY_SECTIONS } from "./CardLibrary";
import type { CardType } from "./types";

const RECENT_STORAGE_KEY = "infomii-slash-recent";
const RECENT_MAX = 5;

function getRecentTypes(): CardType[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY) || "[]";
    return JSON.parse(raw) as CardType[];
  } catch {
    return [];
  }
}

function persistRecent(type: CardType) {
  try {
    const prev = getRecentTypes();
    const next = [type, ...prev.filter((t) => t !== type)].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** 全カードをフラット化（type, label, category） */
type FlatItem = { type: CardType; label: string; category: string };
function flattenItems(): FlatItem[] {
  const out: FlatItem[] = [];
  for (const section of LIBRARY_SECTIONS) {
    for (const item of section.items) {
      out.push({ type: item.type, label: item.label, category: section.title });
    }
  }
  return out;
}

const ALL_ITEMS = flattenItems();

type SlashCommandMenuProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (type: CardType) => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
};

export function SlashCommandMenu({
  open,
  onClose,
  onSelect,
  anchorRef,
}: SlashCommandMenuProps) {
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const recentTypes = getRecentTypes();
  const recentItems = recentTypes
    .map((t) => ALL_ITEMS.find((i) => i.type === t))
    .filter((x): x is FlatItem => !!x);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_ITEMS;
    return ALL_ITEMS.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [search]);

  const displayItems = search.trim() ? filteredItems : recentItems.length > 0 ? recentItems : ALL_ITEMS;
  const showRecentLabel = !search.trim() && recentItems.length > 0;

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setHighlightIndex(0);
    setTimeout(() => inputRef.current?.focus(), 50);
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
        setHighlightIndex((i) => (i + 1) % displayItems.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((i) => (i - 1 + displayItems.length) % displayItems.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = displayItems[highlightIndex];
        if (item) {
          persistRecent(item.type);
          onSelect(item.type);
          onClose();
        }
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, onSelect, highlightIndex, displayItems]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [displayItems.length]);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !open) return;
    const row = el.querySelector(`[data-index="${highlightIndex}"]`) as HTMLElement | undefined;
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightIndex, open]);

  const handleSelect = (item: FlatItem) => {
    persistRecent(item.type);
    onSelect(item.type);
    onClose();
  };

  if (!open || typeof document === "undefined") return null;

  const menu = (
    <div
      role="dialog"
      aria-label="カードを挿入"
      className="z-50 w-[340px] rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      style={getMenuStyle(anchorRef)}
    >
      <div className="border-b border-slate-100 px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="検索… (例: wifi, 朝食)"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-1 focus:ring-blue-200"
          aria-label="カードを検索"
        />
      </div>
      <div
        ref={listRef}
        className="max-h-[min(50vh,360px)] overflow-y-auto p-2"
      >
        {showRecentLabel && (
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            最近使った
          </p>
        )}
        {displayItems.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-slate-500">該当なし</p>
        ) : (
          displayItems.map((item, i) => (
            <button
              key={item.type}
              type="button"
              data-index={i}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                i === highlightIndex ? "bg-blue-50 text-slate-900" : "text-slate-700 hover:bg-slate-50"
              }`}
              onMouseEnter={() => setHighlightIndex(i)}
              onClick={() => handleSelect(item)}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm">
                {CARD_ICONS[item.type] ?? CARD_ICONS.text}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{item.label}</span>
                {!showRecentLabel && (
                  <span className="block truncate text-[11px] text-slate-500">{item.category}</span>
                )}
              </div>
            </button>
          ))
        )}
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
