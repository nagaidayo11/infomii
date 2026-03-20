"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditor2Store } from "./store";
import { savePageCards } from "@/lib/storage";

const DEBOUNCE_MS = 800;

/** カード＋ページ背景変更検知用。 */
function cardsSignature(
  cards: { id: string; order: number; content?: unknown; style?: unknown }[],
  pageBackground: { mode: "solid" | "gradient"; color: string; from: string; to: string; angle: number }
): string {
  return [
    cards.map((c) => `${c.id}:${c.order}:${JSON.stringify(c.content)}:${JSON.stringify(c.style ?? {})}`).join("|"),
    JSON.stringify(pageBackground),
  ].join("::");
}

async function saveAndMerge(
  pageId: string,
  isMounted: { current: boolean }
) {
  const store = useEditor2Store.getState();
  const cards = store.cards;
  const pageStyle = {
    background: {
      mode: store.pageBackgroundMode,
      color: store.pageBackgroundColor,
      from: store.pageGradientFrom,
      to: store.pageGradientTo,
      angle: store.pageGradientAngle,
    },
  } as const;
  store.setAutosaveStatus({ isSaving: true });
  try {
    const { updatedIds } = await savePageCards(pageId, cards, { pageStyle });
    if (!isMounted.current) return;
    const current = useEditor2Store.getState().cards;
    const merged = current.map((c) => ({
      ...c,
      id: updatedIds[c.id] ?? c.id,
    }));
    useEditor2Store.getState().setCards(merged);
    if (isMounted.current) {
      useEditor2Store.getState().setAutosaveStatus({ isSaving: false, lastSavedAt: Date.now(), saveError: null });
    }
  } catch (err) {
    if (isMounted.current) {
      const msg = err instanceof Error ? err.message : "保存に失敗しました";
      useEditor2Store.getState().setAutosaveStatus({ isSaving: false, saveError: msg });
    }
  }
}

async function flushSave(pageId: string) {
  const store = useEditor2Store.getState();
  const cards = store.cards;
  const pageStyle = {
    background: {
      mode: store.pageBackgroundMode,
      color: store.pageBackgroundColor,
      from: store.pageGradientFrom,
      to: store.pageGradientTo,
      angle: store.pageGradientAngle,
    },
  } as const;
  store.setAutosaveStatus({ isSaving: true, saveError: null });
  try {
    await savePageCards(pageId, cards, { pageStyle });
    useEditor2Store.getState().setAutosaveStatus({ isSaving: false, lastSavedAt: Date.now(), saveError: null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "保存に失敗しました";
    useEditor2Store.getState().setAutosaveStatus({ isSaving: false, saveError: msg });
  }
}

/**
 * Auto-save: persists cards to Supabase only when cards array actually changed.
 * Returns retry() to manually retry after a save error.
 */
export function useAutoSaveCards(pageId: string | null) {
  const retry = useCallback(() => {
    if (pageId) void flushSave(pageId);
  }, [pageId]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const pageIdRef = useRef(pageId);
  const lastSignatureRef = useRef<string>("");

  useEffect(() => {
    pageIdRef.current = pageId;
  }, [pageId]);

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

    const s = useEditor2Store.getState();
    lastSignatureRef.current = cardsSignature(s.cards, {
      mode: s.pageBackgroundMode,
      color: s.pageBackgroundColor,
      from: s.pageGradientFrom,
      to: s.pageGradientTo,
      angle: s.pageGradientAngle,
    });

    const unsubscribe = useEditor2Store.subscribe(() => {
      const state = useEditor2Store.getState();
      const sig = cardsSignature(state.cards, {
        mode: state.pageBackgroundMode,
        color: state.pageBackgroundColor,
        from: state.pageGradientFrom,
        to: state.pageGradientTo,
        angle: state.pageGradientAngle,
      });
      if (sig === lastSignatureRef.current) return;
      lastSignatureRef.current = sig;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        timeoutRef.current = null;
        try {
          await saveAndMerge(pageId, isMountedRef);
          if (isMountedRef.current) {
            const s = useEditor2Store.getState();
            lastSignatureRef.current = cardsSignature(s.cards, {
              mode: s.pageBackgroundMode,
              color: s.pageBackgroundColor,
              from: s.pageGradientFrom,
              to: s.pageGradientTo,
              angle: s.pageGradientAngle,
            });
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

  return { retry };
}
