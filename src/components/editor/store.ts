"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { EditorCard, CardType } from "./types";
import { createEmptyCard } from "./types";

export type GeneratedCardInput = {
  type: string;
  content: Record<string, unknown>;
  order: number;
};

/** Page metadata for the current editor page (id, title, slug, publicUrl). Centralized so canvas, library, settings and top bar use the same source. */
export type EditorPageMeta = {
  pageId: string | null;
  title: string;
  slug: string;
  publicUrl: string | null;
};

export type Editor2State = {
  /** All cards for the current page, in display order. */
  cards: EditorCard[];
  /** Undo history (past states). */
  historyPast: EditorCard[][];
  /** Redo stack (future states after undo). */
  historyFuture: EditorCard[][];
  /** Currently selected card id, or null. */
  selectedCardId: string | null;
  /** Set by addCard, cleared after insertion animation (for UI micro-interaction). */
  lastAddedCardId: string | null;
  /** Card IDs to highlight (e.g. after template apply). Cleared after ~3s. */
  highlightedCardIds: Set<string>;
  /** True while a save is in flight. */
  isSaving: boolean;
  /** Timestamp of last successful save (ms), or null if never saved. */
  lastSavedAt: number | null;
  /** Error message when save failed. */
  saveError: string | null;
  /** Current page metadata (id, title, slug, publicUrl). */
  pageMeta: EditorPageMeta;
  /** Show grid on canvas. */
  showGrid: boolean;
  /** Page theme: light | dark. */
  pageTheme: "light" | "dark";
  /** Preview page background mode. */
  pageBackgroundMode: "solid" | "gradient";
  /** Solid background color (hex/css). */
  pageBackgroundColor: string;
  /** Gradient start color. */
  pageGradientFrom: string;
  /** Gradient end color. */
  pageGradientTo: string;
  /** Gradient angle (deg). */
  pageGradientAngle: number;
  setCards: (cards: EditorCard[]) => void;
  setShowGrid: (show: boolean) => void;
  setPageTheme: (theme: "light" | "dark") => void;
  setPageBackground: (patch: {
    mode?: "solid" | "gradient";
    color?: string;
    from?: string;
    to?: string;
    angle?: number;
  }) => void;
  setAutosaveStatus: (payload: { isSaving?: boolean; lastSavedAt?: number | null; saveError?: string | null }) => void;
  setPageMeta: (meta: Partial<EditorPageMeta>) => void;
  /** Highlight cards (e.g. from template). Auto-clears after 3s. */
  highlightFromTemplate: (cardIds: string[]) => void;
  /** Load cards from API (e.g. AI generate from URL). Adds id, normalizes order. */
  loadGeneratedCards: (cards: GeneratedCardInput[]) => void;
  addCard: (type: CardType, index?: number) => void;
  updateCard: (id: string, patch: { content?: Record<string, unknown>; style?: Record<string, unknown> }) => void;
  reorderCards: (cards: EditorCard[]) => void;
  selectCard: (id: string | null) => void;
  removeCard: (id: string) => void;
  duplicateCard: (id: string) => void;
  undo: () => void;
  redo: () => void;
};

/** Matches .card-insert CSS animation (280ms) + small buffer so class is cleared after animation. */
const INSERT_ANIMATION_MS = 320;

const HISTORY_MAX = 50;

const initialPageMeta: EditorPageMeta = {
  pageId: null,
  title: "",
  slug: "",
  publicUrl: null,
};

function pushHistory(past: EditorCard[][], cards: EditorCard[]): EditorCard[][] {
  const next = [...past, cards.map((c) => ({ ...c }))];
  return next.slice(-HISTORY_MAX);
}

export const useEditor2Store = create<Editor2State>((set, get) => ({
  cards: [],
  historyPast: [],
  historyFuture: [],
  selectedCardId: null,
  lastAddedCardId: null,
  highlightedCardIds: new Set<string>(),
  isSaving: false,
  lastSavedAt: null,
  saveError: null,
  pageMeta: initialPageMeta,
  showGrid: true,
  pageTheme: "light",
  pageBackgroundMode: "solid",
  pageBackgroundColor: "#ffffff",
  pageGradientFrom: "#f8fafc",
  pageGradientTo: "#e2e8f0",
  pageGradientAngle: 180,

  setCards: (cards) => set({ cards }),

  setShowGrid: (show) => set({ showGrid: show }),
  setPageTheme: (theme) => set({ pageTheme: theme }),
  setPageBackground: (patch) =>
    set(() => ({
      ...(patch.mode !== undefined ? { pageBackgroundMode: patch.mode } : {}),
      ...(patch.color !== undefined ? { pageBackgroundColor: patch.color } : {}),
      ...(patch.from !== undefined ? { pageGradientFrom: patch.from } : {}),
      ...(patch.to !== undefined ? { pageGradientTo: patch.to } : {}),
      ...(patch.angle !== undefined ? { pageGradientAngle: patch.angle } : {}),
    })),

  setAutosaveStatus: (payload) =>
    set(() => ({
      ...(payload.isSaving !== undefined && { isSaving: payload.isSaving }),
      ...(payload.lastSavedAt !== undefined && { lastSavedAt: payload.lastSavedAt }),
      ...(payload.saveError !== undefined && { saveError: payload.saveError }),
    })),

  setPageMeta: (meta) =>
    set((s) => ({
      pageMeta: { ...s.pageMeta, ...meta },
    })),

  highlightFromTemplate: (cardIds) => {
    set({ highlightedCardIds: new Set(cardIds) });
    setTimeout(() => set({ highlightedCardIds: new Set<string>() }), 3000);
  },

  loadGeneratedCards: (inputs) => {
    const allowed: CardType[] = ["hero", "info", "highlight", "action", "welcome", "wifi", "breakfast", "checkout", "notice", "nearby", "map", "button", "image", "text", "faq", "emergency", "laundry", "taxi", "restaurant", "spa", "gallery", "divider", "schedule", "menu", "parking", "pageLinks"];
    const cards: EditorCard[] = inputs
      .filter((c) => allowed.includes(c.type as CardType))
      .sort((a, b) => a.order - b.order)
      .map((c, i) => ({
        id: nanoid(10),
        type: c.type as CardType,
        content: c.content ?? {},
        order: i,
      }));
    set({ cards, selectedCardId: cards[0]?.id ?? null });
  },

  addCard: (type, index?: number) => {
    const allowed: CardType[] = ["hero", "info", "highlight", "action", "welcome", "wifi", "breakfast", "checkout", "notice", "nearby", "map", "button", "image", "text", "faq", "emergency", "laundry", "taxi", "restaurant", "spa", "gallery", "divider", "schedule", "menu", "parking", "pageLinks"];
    if (!allowed.includes(type)) return;
    const { cards, historyPast } = get();
    const insertAt = index != null ? Math.min(Math.max(0, index), cards.length) : cards.length;
    const id = nanoid(10);
    const card = createEmptyCard(type, id, insertAt);
    const next = [...cards];
    next.splice(insertAt, 0, card);
    const withOrder = next.map((c, i) => ({ ...c, order: i }));
    set({
      cards: withOrder,
      selectedCardId: id,
      lastAddedCardId: id,
      historyPast: pushHistory(historyPast, cards),
      historyFuture: [],
    });
    setTimeout(() => set({ lastAddedCardId: null }), INSERT_ANIMATION_MS);
  },

  updateCard: (id, patch) =>
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id === id
          ? {
              ...c,
              ...(patch.content !== undefined ? { content: { ...c.content, ...patch.content } } : {}),
              ...(patch.style !== undefined ? { style: { ...(c.style ?? {}), ...patch.style } } : {}),
            }
          : c
      ),
    })),

  reorderCards: (cards) => {
    const { historyPast } = get();
    const withOrder = cards.map((c, i) => ({ ...c, order: i }));
    set({ cards: withOrder, historyPast: pushHistory(historyPast, get().cards), historyFuture: [] });
  },

  selectCard: (id) => set({ selectedCardId: id }),

  removeCard: (id) =>
    set((s) => {
      const next = s.cards
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, order: i }));
      return {
        cards: next,
        selectedCardId: s.selectedCardId === id ? null : s.selectedCardId,
        historyPast: pushHistory(s.historyPast, s.cards),
        historyFuture: [],
      };
    }),

  duplicateCard: (id) => {
    const { cards, historyPast } = get();
    const idx = cards.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const src = cards[idx];
    const newId = nanoid(10);
    const copy: EditorCard = {
      ...src,
      id: newId,
      order: idx + 1,
      content: { ...src.content },
    };
    const next = [...cards];
    next.splice(idx + 1, 0, copy);
    const withOrder = next.map((c, i) => ({ ...c, order: i }));
    set({ cards: withOrder, selectedCardId: newId, historyPast: pushHistory(historyPast, cards), historyFuture: [] });
    setTimeout(() => set({ lastAddedCardId: newId }), 0);
    setTimeout(() => set({ lastAddedCardId: null }), INSERT_ANIMATION_MS);
  },

  undo: () => {
    const { historyPast, cards, historyFuture } = get();
    if (historyPast.length === 0) return;
    const prev = historyPast[historyPast.length - 1];
    set({
      cards: prev.map((c, i) => ({ ...c, order: i })),
      historyPast: historyPast.slice(0, -1),
      historyFuture: [cards, ...historyFuture],
    });
  },

  redo: () => {
    const { historyPast, cards, historyFuture } = get();
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    set({
      cards: next.map((c, i) => ({ ...c, order: i })),
      historyPast: pushHistory(historyPast, cards),
      historyFuture: historyFuture.slice(1),
    });
  },
}));
