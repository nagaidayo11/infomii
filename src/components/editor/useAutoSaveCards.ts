"use client";

import { useEffect, useRef } from "react";
import { useEditor2Store } from "./store";
import { savePageCards } from "@/lib/storage";

const DEBOUNCE_MS = 500;

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
 * Auto-save: subscribes to editor cards and persists to Supabase after a short
 * debounce. No save button — changes save automatically after editing.
 * Flushes pending save on unmount so the last edit is not lost.
 */
export function useAutoSaveCards(pageId: string | null) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const pageIdRef = useRef(pageId);
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

    const unsubscribe = useEditor2Store.subscribe(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        timeoutRef.current = null;
        try {
          await saveAndMerge(pageId, isMountedRef);
        } catch {
          // Silent fail; could toast later
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
