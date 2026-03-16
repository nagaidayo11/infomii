"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocaleProvider } from "@/components/locale-context";
import { EditorLayout } from "./EditorLayout";
import { CardLibrary } from "./CardLibrary";
import { Canvas } from "./Canvas";
import { SettingsPanel } from "./SettingsPanel";
import { PublishModal } from "./PublishModal";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { useEditor2Store } from "./store";
import type { CardType } from "./types";
import { getPage, buildPublicUrlV } from "@/lib/storage";

/**
 * Canvas-based card editor — Notion-like experience.
 * Three panels: Card Library | Canvas (375px mobile preview) | Card Settings.
 * Type "/" to open quick-insert menu; add cards from library or slash menu.
 */
type Editor2Props = { pageId?: string | null };

export function Editor2({ pageId }: Editor2Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [publishState, setPublishState] = useState<{
    publicUrl: string;
    pageTitle: string;
  } | null>(null);

  const cards = useEditor2Store((s) => s.cards);
  const selectedCardId = useEditor2Store((s) => s.selectedCardId);
  const lastAddedCardId = useEditor2Store((s) => s.lastAddedCardId);
  const addCard = useEditor2Store((s) => s.addCard);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const reorderCards = useEditor2Store((s) => s.reorderCards);
  const selectCard = useEditor2Store((s) => s.selectCard);

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
    const page = await getPage(pageId);
    if (!page) return;
    const publicUrl = buildPublicUrlV(page.slug);
    setPublishState({ publicUrl, pageTitle: page.title || "無題" });
  }, [pageId]);

  return (
    <LocaleProvider value="ja">
      <div ref={rootRef} className="h-full">
        <EditorLayout
          library={<CardLibrary onAddCard={addCard} />}
          canvas={
            <div ref={canvasRef} className="flex h-full flex-col">
              {pageId && (
                <div className="flex shrink-0 items-center justify-end gap-2 border-b border-slate-200/80 bg-white px-4 py-2">
                  <button
                    type="button"
                    onClick={handlePublishClick}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    公開
                  </button>
                </div>
              )}
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
            <SettingsPanel card={selectedCard} onUpdate={updateCard} />
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
            onClose={() => setPublishState(null)}
          />
        )}
      </div>
    </LocaleProvider>
  );
}
