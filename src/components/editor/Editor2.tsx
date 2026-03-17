"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocaleProvider } from "@/components/locale-context";
import { EditorLayout } from "./EditorLayout";
import { EditorTopBar } from "./EditorTopBar";
import { CardLibrary } from "./CardLibrary";
import { Canvas } from "./Canvas";
import { FreeformCanvas } from "./FreeformCanvas";
import { CardSettings } from "./SettingsPanel";
import { PublishModal } from "./PublishModal";
import { SaveToast } from "./SaveToast";
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
  const highlightedCardIds = useEditor2Store((s) => s.highlightedCardIds);
  const layoutMode = useEditor2Store((s) => s.layoutMode);
  const setLayoutMode = useEditor2Store((s) => s.setLayoutMode);
  const showGrid = useEditor2Store((s) => s.showGrid);
  const setShowGrid = useEditor2Store((s) => s.setShowGrid);
  const pageTheme = useEditor2Store((s) => s.pageTheme);
  const setPageTheme = useEditor2Store((s) => s.setPageTheme);
  const isSaving = useEditor2Store((s) => s.isSaving);
  const lastSavedAt = useEditor2Store((s) => s.lastSavedAt);
  const saveError = useEditor2Store((s) => s.saveError);
  const pageMeta = useEditor2Store((s) => s.pageMeta);
  const addCard = useEditor2Store((s) => s.addCard);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const reorderCards = useEditor2Store((s) => s.reorderCards);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const removeCard = useEditor2Store((s) => s.removeCard);
  const duplicateCard = useEditor2Store((s) => s.duplicateCard);
  const undo = useEditor2Store((s) => s.undo);
  const redo = useEditor2Store((s) => s.redo);
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

  const { retry } = useAutoSaveCards(pageId ?? null);

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

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (slashMenuOpen) return;
      const root = rootRef.current;
      const target = e.target as HTMLElement | null;
      if (!root || !target || !root.contains(target)) return;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) {
        const isEmpty =
          (target as HTMLInputElement | HTMLTextAreaElement).value?.trim() === "" ||
          target.textContent?.trim() === "";
        if (isEmpty) {
          if (e.key === "Backspace" || e.key === "Delete") {
            const cardEl = target.closest("[data-card-id]");
            const cardId = cardEl?.getAttribute("data-card-id");
            if (cardId && selectedCardId === cardId) {
              e.preventDefault();
              removeCard(cardId);
              (target as HTMLElement).blur();
            }
            return;
          }
          if (e.key === "Enter" && !e.shiftKey) {
            const cardEl = target.closest("[data-card-id]");
            const cardId = cardEl?.getAttribute("data-card-id");
            if (cardId) {
              e.preventDefault();
              const idx = cards.findIndex((c) => c.id === cardId);
              if (idx >= 0) {
                addCard("text", idx + 1);
                (target as HTMLElement).blur();
              }
            }
            return;
          }
        }
        if (e.key === "Backspace" || e.key === "Delete") return;
      }
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key === "d") {
        e.preventDefault();
        if (selectedCardId) duplicateCard(selectedCardId);
        return;
      }
      if ((e.key === "Backspace" || e.key === "Delete") && selectedCardId) {
        const el = target as HTMLElement;
        if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA" && !el.isContentEditable) {
          e.preventDefault();
          removeCard(selectedCardId);
        }
      }
    },
    [undo, redo, duplicateCard, removeCard, addCard, selectedCardId, slashMenuOpen, cards]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

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
        saveError={saveError}
        onRetry={retry}
        status="draft"
        publicUrl={pageMeta.publicUrl}
        publishing={publishing}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        showGrid={showGrid}
        onShowGridChange={setShowGrid}
        pageTheme={pageTheme}
        onPageThemeChange={setPageTheme}
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
                {layoutMode === "freeform" ? (
                  <FreeformCanvas
                    cards={cards}
                    selectedCardId={selectedCardId}
                    onSelectCard={selectCard}
                    onUpdateCard={updateCard}
                    onDuplicateCard={duplicateCard}
                    onRemoveCard={removeCard}
                  />
                ) : (
                  <Canvas
                    cards={cards}
                    selectedCardId={selectedCardId}
                    lastAddedCardId={lastAddedCardId}
                    highlightedCardIds={highlightedCardIds}
                    onSelectCard={selectCard}
                    onReorder={reorderCards}
                    onDuplicateCard={duplicateCard}
                    onRemoveCard={removeCard}
                  />
                )}
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
        <SaveToast lastSavedAt={lastSavedAt} />
      </div>
    </LocaleProvider>
  );
}
