"use client";

import { useEffect, useRef } from "react";
import { useEditor2Store } from "./store";
import { savePageCards } from "@/lib/storage";

const DEBOUNCE_MS = 600;

async function saveAndMerge(
  pageId: string,
  isMounted: { current: boolean }
) {
  const cards = useEditor2Store.getState().cards;
  const { updatedIds } = await savePageCards(pageId, cards);
  if (!isMounted.current) return;
  const current = useEditor2Store.getState().cards;
  const merged = current.map((c) => ({
    ...c,
    id: updatedIds[c.id] ?? c.id,
  }));
  useEditor2Store.getState().setCards(merged);
}

async function flushSave(pageId: string) {
  const cards = useEditor2Store.getState().cards;
  await savePageCards(pageId, cards);
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
