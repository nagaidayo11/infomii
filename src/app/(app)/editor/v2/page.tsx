"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";
import { Editor2 } from "@/components/editor";
import { useAutoSaveCards } from "@/components/editor/useAutoSaveCards";
import { createEmptyCard, STARTER_CARD_TYPES } from "@/components/editor/types";
import type { CardType } from "@/components/editor/types";
import { useEditor2Store } from "@/components/editor/store";
import { getPage, getPageCards, rowToCard, savePageCards } from "@/lib/storage";
import { migrateCardsForEditor } from "@/lib/migrate-cards";

function Editor2WithPageId() {
  const searchParams = useSearchParams();
  const pageId = searchParams.get("pageId");
  const [loaded, setLoaded] = useState(false);
  const setCards = useEditor2Store((s) => s.setCards);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const setAutosaveStatus = useEditor2Store((s) => s.setAutosaveStatus);

  useAutoSaveCards(pageId);

  useEffect(() => {
    if (!pageId) return;
    Promise.all([getPage(pageId), getPageCards(pageId)]).then(async ([page, rows]) => {
      const cardsFromDb = rows.map((r) => {
        const card = rowToCard(r);
        return { ...card, type: card.type as CardType };
      });
      const cards = migrateCardsForEditor(cardsFromDb);

      if (cards.length > 0) {
        setCards(cards);
        selectCard(cards[0]?.id ?? null);
        setAutosaveStatus({ isSaving: false, lastSavedAt: Date.now() });
        setLoaded(true);
        return;
      }

      // New page: initialize with starter cards (Welcome, WiFi, Breakfast, Checkout, Nearby)
      if (page) {
        const starterCards = STARTER_CARD_TYPES.map((type, i) =>
          createEmptyCard(type, nanoid(10), i)
        );
        try {
          const { updatedIds } = await savePageCards(pageId, starterCards);
          const merged = starterCards.map((c) => ({
            ...c,
            id: updatedIds[c.id] ?? c.id,
          }));
          setCards(merged);
          selectCard(merged[0]?.id ?? null);
          setAutosaveStatus({ isSaving: false, lastSavedAt: Date.now() });
        } catch {
          setCards(starterCards);
          selectCard(starterCards[0]?.id ?? null);
        }
      }
      setLoaded(true);
    });
  }, [pageId, setCards, selectCard, setAutosaveStatus]);

  if (!pageId) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        ページを選択してください
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        読み込み中…
      </div>
    );
  }

  return <Editor2 pageId={pageId} />;
}

/**
 * Infomii Editor 2.0 — Card-based CMS editor.
 * /editor/v2 — ?pageId=xxx でページのカードを読み込む。
 */
export default function Editor2Page() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-slate-500">読み込み中…</div>}>
      <Editor2WithPageId />
    </Suspense>
  );
}
