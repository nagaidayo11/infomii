"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { nanoid } from "nanoid";
import { Editor2 } from "@/components/editor";
import { useAutoSaveCards } from "@/components/editor/useAutoSaveCards";
import { createEmptyCard, STARTER_CARD_TYPES } from "@/components/editor/types";
import type { CardType } from "@/components/editor/types";
import { useEditor2Store } from "@/components/editor/store";
import { getPage, getPageCards, rowToCard, savePageCards } from "@/lib/storage";

function EditorWithPageId() {
  const params = useParams();
  const pageId = typeof params.id === "string" ? params.id : null;
  const [pageFound, setPageFound] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);
  const setCards = useEditor2Store((s) => s.setCards);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const setAutosaveStatus = useEditor2Store((s) => s.setAutosaveStatus);

  useAutoSaveCards(pageId);

  useEffect(() => {
    if (!pageId) return;
    Promise.all([getPage(pageId), getPageCards(pageId)]).then(async ([page, rows]) => {
      setPageFound(!!page);
      const cardsFromDb = rows.map((r) => {
        const card = rowToCard(r);
        return { ...card, type: card.type as CardType };
      });

      if (cardsFromDb.length > 0) {
        setCards(cardsFromDb);
        selectCard(cardsFromDb[0]?.id ?? null);
        setAutosaveStatus({ isSaving: false, lastSavedAt: Date.now() });
        setLoaded(true);
        return;
      }

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
        ページが見つかりません
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

  if (pageFound === false) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        ページが見つかりません
      </div>
    );
  }

  return <Editor2 pageId={pageId} />;
}

/**
 * Editor page at /editor/[id]. Loads page and cards, initializes starter cards for new pages.
 * Dashboard "Create Page" redirects here with /editor/{pageId}.
 */
export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-slate-500">
          読み込み中…
        </div>
      }
    >
      <EditorWithPageId />
    </Suspense>
  );
}
