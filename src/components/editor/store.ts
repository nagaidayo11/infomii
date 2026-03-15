"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import type { EditorCard, CardType } from "./types";
import { createEmptyCard } from "./types";

export type Editor2State = {
  cards: EditorCard[];
  selectedCardId: string | null;
  setCards: (cards: EditorCard[]) => void;
  addCard: (type: CardType) => void;
  updateCard: (id: string, content: Record<string, unknown>) => void;
  reorderCards: (cards: EditorCard[]) => void;
  selectCard: (id: string | null) => void;
  removeCard: (id: string) => void;
};

export const useEditor2Store = create<Editor2State>((set, get) => ({
  cards: [],
  selectedCardId: null,

  setCards: (cards) => set({ cards }),

  addCard: (type) => {
    const cards = get().cards;
    const order = cards.length;
    const id = nanoid(10);
    const card = createEmptyCard(type, id, order);
    set({ cards: [...cards, card], selectedCardId: id });
  },

  updateCard: (id, content) =>
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, content: { ...c.content, ...content } } : c
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
