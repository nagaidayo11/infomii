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
  /** Currently selected card id, or null. */
  selectedCardId: string | null;
  /** Set by addCard, cleared after insertion animation (for UI micro-interaction). */
  lastAddedCardId: string | null;
  /** True while a save is in flight. */
  isSaving: boolean;
  /** Timestamp of last successful save (ms), or null if never saved. */
  lastSavedAt: number | null;
  /** Current page metadata (id, title, slug, publicUrl). */
  pageMeta: EditorPageMeta;
  setCards: (cards: EditorCard[]) => void;
  setAutosaveStatus: (payload: { isSaving?: boolean; lastSavedAt?: number | null }) => void;
  setPageMeta: (meta: Partial<EditorPageMeta>) => void;
  /** Load cards from API (e.g. AI generate from URL). Adds id, normalizes order. */
  loadGeneratedCards: (cards: GeneratedCardInput[]) => void;
  addCard: (type: CardType) => void;
  updateCard: (id: string, patch: { content?: Record<string, unknown>; style?: Record<string, unknown> }) => void;
  reorderCards: (cards: EditorCard[]) => void;
  selectCard: (id: string | null) => void;
  removeCard: (id: string) => void;
};

/** Matches .card-insert CSS animation (280ms) + small buffer so class is cleared after animation. */
const INSERT_ANIMATION_MS = 320;

const initialPageMeta: EditorPageMeta = {
  pageId: null,
  title: "",
  slug: "",
  publicUrl: null,
};

export const useEditor2Store = create<Editor2State>((set, get) => ({
  cards: [],
  selectedCardId: null,
  lastAddedCardId: null,
  isSaving: false,
  lastSavedAt: null,
  pageMeta: initialPageMeta,

  setCards: (cards) => set({ cards }),

  setAutosaveStatus: (payload) =>
    set((s) => ({
      ...(payload.isSaving !== undefined && { isSaving: payload.isSaving }),
      ...(payload.lastSavedAt !== undefined && { lastSavedAt: payload.lastSavedAt }),
    })),

  setPageMeta: (meta) =>
    set((s) => ({
      pageMeta: { ...s.pageMeta, ...meta },
    })),

  loadGeneratedCards: (inputs) => {
    const allowed: CardType[] = ["welcome", "wifi", "breakfast", "checkout", "notice", "nearby", "map", "button", "image", "text", "faq", "emergency", "laundry", "taxi", "restaurant", "spa", "gallery", "divider"];
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

  addCard: (type) => {
    const allowed: CardType[] = ["welcome", "wifi", "breakfast", "checkout", "notice", "nearby", "map", "button", "image", "text", "faq", "emergency", "laundry", "taxi", "restaurant", "spa", "gallery", "divider"];
    if (!allowed.includes(type)) return;
    const cards = get().cards;
    const order = cards.length; // append at bottom of page
    const id = nanoid(10);
    const card = createEmptyCard(type, id, order);
    set({ cards: [...cards, card], selectedCardId: id, lastAddedCardId: id });
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
    const withOrder = cards.map((c, i) => ({ ...c, order: i }));
    set({ cards: withOrder });
    // Caller can subscribe to store and persist order to Supabase when cards change.
  },

  selectCard: (id) => set({ selectedCardId: id }),

  removeCard: (id) =>
    set((s) => ({
      cards: s.cards
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, order: i })),
      selectedCardId: s.selectedCardId === id ? null : s.selectedCardId,
    })),
}));
