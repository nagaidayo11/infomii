"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SaasEditorLayout } from "./SaasEditorLayout";
import { SaasEditorTopBar } from "./SaasEditorTopBar";
import { BlockListSidebar } from "./BlockListSidebar";
import { CanvaCanvas } from "./CanvaCanvas";
import { StylePanel } from "./StylePanel";
import { useSaasEditorStore } from "./store";
import { useAutoSaveBlocks } from "./useAutoSaveBlocks";
import { loadSaasPage, createSaasPage } from "@/lib/saas-editor-db";
import type { SaasBlock } from "./types";

type SaasEditorProps = { pageId?: string | null };

export function SaasEditor({ pageId: initialPageId }: SaasEditorProps) {
  const router = useRouter();
  const [pageId, setPageId] = useState<string | null>(initialPageId ?? null);
  const setPage = useSaasEditorStore((s) => s.setPage);
  const setBlocks = useSaasEditorStore((s) => s.setBlocks);
  const pageTitle = useSaasEditorStore((s) => s.pageTitle);
  const isSaving = useSaasEditorStore((s) => s.isSaving);
  const lastSavedAt = useSaasEditorStore((s) => s.lastSavedAt);

  useAutoSaveBlocks(pageId);

  useEffect(() => {
    if (!initialPageId) {
      setPage(null, "");
      setBlocks([]);
      setPageId(null);
      return;
    }
    setPageId(initialPageId);
    loadSaasPage(initialPageId).then((page) => {
      if (page) {
        setPage(page.id, page.title);
        setBlocks((page.blocks as SaasBlock[]) ?? []);
      }
    });
  }, [initialPageId, setPage, setBlocks]);

  const handleNewPage = async () => {
    const page = await createSaasPage("");
    if (page) {
      router.push(`/editor/saas/${page.id}`);
    }
  };

  const topBar = (
    <SaasEditorTopBar
      pageTitle={pageTitle}
      isSaving={isSaving}
      lastSavedAt={lastSavedAt}
      onNewPage={handleNewPage}
    />
  );

  return (
    <SaasEditorLayout
      topBar={topBar}
      sidebar={<BlockListSidebar />}
      canvas={<CanvaCanvas />}
      rightPanel={<StylePanel />}
    />
  );
}
