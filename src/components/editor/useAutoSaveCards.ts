"use client";

import { useEffect, useRef } from "react";
import { useEditor2Store } from "./store";
import { savePageCards } from "@/lib/storage";

const DEBOUNCE_MS = 800;

/** カードの変更検知用。id・order・content・style が変わったときだけ保存する。 */
function cardsSignature(cards: { id: string; order: number; content?: unknown; style?: unknown }[]): string {
  return cards.map((c) => `${c.id}:${c.order}:${JSON.stringify(c.content)}:${JSON.stringify(c.style ?? {})}`).join("|");
}

async function saveAndMerge(
  pageId: string,
  isMounted: { current: boolean }
) {
  const store = useEditor2Store.getState();
  const cards = store.cards;
  store.setAutosaveStatus({ isSaving: true });
  try {
    const { updatedIds } = await savePageCards(pageId, cards);
    if (!isMounted.current) return;
    const current = useEditor2Store.getState().cards;
    const merged = current.map((c) => ({
      ...c,
      id: updatedIds[c.id] ?? c.id,
    }));
    useEditor2Store.getState().setCards(merged);
    if (isMounted.current) {
      useEditor2Store.getState().setAutosaveStatus({ isSaving: false, lastSavedAt: Date.now() });
    }
  } catch {
    if (isMounted.current) {
      useEditor2Store.getState().setAutosaveStatus({ isSaving: false });
    }
  }
}

async function flushSave(pageId: string) {
  const store = useEditor2Store.getState();
  const cards = store.cards;
  store.setAutosaveStatus({ isSaving: true });
  try {
    await savePageCards(pageId, cards);
    useEditor2Store.getState().setAutosaveStatus({ isSaving: false, lastSavedAt: Date.now() });
  } catch {
    useEditor2Store.getState().setAutosaveStatus({ isSaving: false });
  }
}

/**
 * Auto-save: persists cards to Supabase only when cards array actually changed
 * (by signature of id+order). Avoids flickering "Saving…" / "Saved" when other
 * store fields (e.g. selectedCardId) change.
 */
export function useAutoSaveCards(pageId: string | null) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const pageIdRef = useRef(pageId);
  const lastSignatureRef = useRef<string>("");
  pageIdRef.current = pageId;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!pageId) return;

    lastSignatureRef.current = cardsSignature(useEditor2Store.getState().cards);

    const unsubscribe = useEditor2Store.subscribe(() => {
      const state = useEditor2Store.getState();
      const sig = cardsSignature(state.cards);
      if (sig === lastSignatureRef.current) return;
      lastSignatureRef.current = sig;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        timeoutRef.current = null;
        try {
          await saveAndMerge(pageId, isMountedRef);
          if (isMountedRef.current) {
            lastSignatureRef.current = cardsSignature(useEditor2Store.getState().cards);
          }
        } catch {
          // Silent fail
        }
      }, DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        const id = pageIdRef.current;
        if (id) void flushSave(id);
      }
    };
  }, [pageId]);
}
