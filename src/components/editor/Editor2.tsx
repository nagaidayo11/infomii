"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocaleProvider } from "@/components/locale-context";
import { EditorLayout } from "./EditorLayout";
import { EditorTopBar } from "./EditorTopBar";
import { CardLibrary } from "./CardLibrary";
import { Canvas } from "./Canvas";
import { CardSettings } from "./SettingsPanel";
import { PublishModal } from "./PublishModal";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { useEditor2Store } from "./store";
import { useAutoSaveCards } from "./useAutoSaveCards";
import type { CardType } from "./types";
import { getPage, buildPublicUrlV, savePageCards } from "@/lib/storage";

/**
 * Canvas-based card editor — Notion-like experience.
 * State is centralized in useEditor2Store (cards, selectedCardId, isSaving, pageMeta).
 * Canvas, library and settings all use the same store.
 */
type Editor2Props = { pageId?: string | null };

export function Editor2({ pageId }: Editor2Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [publishState, setPublishState] = useState<{
    publicUrl: string;
    pageTitle: string;
    slug: string;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);

  const cards = useEditor2Store((s) => s.cards);
  const selectedCardId = useEditor2Store((s) => s.selectedCardId);
  const lastAddedCardId = useEditor2Store((s) => s.lastAddedCardId);
  const isSaving = useEditor2Store((s) => s.isSaving);
  const lastSavedAt = useEditor2Store((s) => s.lastSavedAt);
  const pageMeta = useEditor2Store((s) => s.pageMeta);
  const addCard = useEditor2Store((s) => s.addCard);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const reorderCards = useEditor2Store((s) => s.reorderCards);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const setPageMeta = useEditor2Store((s) => s.setPageMeta);

  useEffect(() => {
    if (!pageId) {
      setPageMeta({ pageId: null, title: "", slug: "", publicUrl: null });
      return;
    }
    getPage(pageId).then((page) => {
      if (page) {
        setPageMeta({
          pageId,
          title: page.title || "無題のページ",
          slug: page.slug,
          publicUrl: buildPublicUrlV(page.slug),
        });
      }
    });
  }, [pageId, setPageMeta]);

  // Auto-save: persist cards after changes (debounced). Status shown in top bar; no manual save button.
  useAutoSaveCards(pageId ?? null);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) ?? null,
    [cards, selectedCardId]
  );

  const handleSlashKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== "/") return;
    const root = rootRef.current;
    const target = e.target as Node | null;
    if (!root || !target || !root.contains(target)) return;
    const el = target as HTMLElement;
    if (
      el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable
    ) {
      return;
    }
    e.preventDefault();
    setSlashMenuOpen(true);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleSlashKey);
    return () => document.removeEventListener("keydown", handleSlashKey);
  }, [handleSlashKey]);

  const handleSlashSelect = useCallback(
    (type: CardType) => {
      addCard(type);
      setSlashMenuOpen(false);
    },
    [addCard]
  );

  const handlePublishClick = useCallback(async () => {
    if (!pageId) return;
    setPublishing(true);
    try {
      const { cards } = useEditor2Store.getState();
      await savePageCards(pageId, cards);
      const page = await getPage(pageId);
      if (!page?.slug) {
        setPublishing(false);
        return;
      }
      const publicUrl = buildPublicUrlV(page.slug);
      setPublishState({
        publicUrl,
        pageTitle: page.title || "無題",
        slug: page.slug,
      });
    } finally {
      setPublishing(false);
    }
  }, [pageId]);

  const handlePreviewClick = useCallback(() => {
    if (pageMeta.publicUrl) window.open(pageMeta.publicUrl, "_blank", "noopener,noreferrer");
  }, [pageMeta.publicUrl]);

  const topBar =
    pageId ? (
      <EditorTopBar
        pageTitle={pageMeta.title}
        saving={isSaving}
        lastSavedAt={lastSavedAt}
        status="draft"
        publicUrl={pageMeta.publicUrl}
        publishing={publishing}
        onPreview={handlePreviewClick}
        onPublish={handlePublishClick}
        onQr={handlePublishClick}
      />
    ) : null;

  return (
    <LocaleProvider value="ja">
      <div ref={rootRef} className="h-screen w-full overflow-hidden">
        <EditorLayout
          topBar={topBar}
          library={<CardLibrary onAddCard={addCard} />}
          canvas={
            <div ref={canvasRef} className="flex h-full flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-auto">
                <Canvas
                  cards={cards}
                  selectedCardId={selectedCardId}
                  lastAddedCardId={lastAddedCardId}
                  onSelectCard={selectCard}
                  onReorder={reorderCards}
                />
              </div>
            </div>
          }
          settings={
            <CardSettings card={selectedCard} onUpdate={updateCard} lastAddedCardId={lastAddedCardId} />
          }
        />
        <SlashCommandMenu
          open={slashMenuOpen}
          onClose={() => setSlashMenuOpen(false)}
          onSelect={handleSlashSelect}
          anchorRef={canvasRef}
        />
        {publishState && (
          <PublishModal
            publicUrl={publishState.publicUrl}
            pageTitle={publishState.pageTitle}
            slug={publishState.slug}
            onClose={() => setPublishState(null)}
          />
        )}
      </div>
    </LocaleProvider>
  );
}
