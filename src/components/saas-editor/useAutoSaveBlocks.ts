"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSaasEditorStore } from "./store";
import { saveSaasPageBlocks } from "@/lib/saas-editor-db";

const DEBOUNCE_MS = 1200;

export function useAutoSaveBlocks(pageId: string | null) {
  const blocks = useSaasEditorStore((s) => s.blocks);
  const setSaving = useSaasEditorStore((s) => s.setSaving);
  const setLastSavedAt = useSaasEditorStore((s) => s.setLastSavedAt);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevBlocksRef = useRef<string>("");

  const persist = useCallback(async () => {
    if (!pageId) return;
    setSaving(true);
    const { error } = await saveSaasPageBlocks(pageId, blocks);
    setSaving(false);
    if (!error) setLastSavedAt(Date.now());
  }, [pageId, blocks, setSaving, setLastSavedAt]);

  useEffect(() => {
    const json = JSON.stringify(blocks.map((b) => b.id));
    if (prevBlocksRef.current === json) return;
    prevBlocksRef.current = json;

    if (!pageId) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      persist();
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pageId, blocks, persist]);

  return { persist };
}
