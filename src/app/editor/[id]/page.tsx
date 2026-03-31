"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { Editor2 } from "@/components/editor";
import { createEmptyCard, STARTER_CARD_TYPES } from "@/components/editor/types";
import type { CardType } from "@/components/editor/types";
import { useEditor2Store } from "@/components/editor/store";
import {
  getInformation,
  getPage,
  getPageCards,
  getPageStyleFromRows,
  listPagesForHotel,
  rowToCard,
  savePageCards,
} from "@/lib/storage";
import { migrateCardsForEditor } from "@/lib/migrate-cards";

function EditorWithPageId() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageId = typeof params.id === "string" ? params.id : null;
  const fromTemplate = searchParams.get("from") === "template";
  const [pageFound, setPageFound] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);
  const setCards = useEditor2Store((s) => s.setCards);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const setAutosaveStatus = useEditor2Store((s) => s.setAutosaveStatus);
  const setPageBackground = useEditor2Store((s) => s.setPageBackground);
  const highlightFromTemplate = useEditor2Store((s) => s.highlightFromTemplate);

  useEffect(() => {
    if (!pageId) return;
    Promise.all([getPage(pageId), getPageCards(pageId)]).then(async ([page, rows]) => {
      if (!page) {
        const legacy = await getInformation(pageId).catch(() => null);
        if (legacy) {
          const pages = await listPagesForHotel().catch(() => []);
          const resolved =
            pages.find((p) => p.slug === legacy.slug) ??
            pages.find((p) => p.title.trim() && p.title.trim() === legacy.title.trim());
          if (resolved) {
            router.replace(`/editor/${resolved.id}`);
            return;
          }
        }
      }
      setPageFound(!!page);
      const pageStyle = getPageStyleFromRows(rows);
      if (pageStyle?.background) {
        setPageBackground({
          mode: pageStyle.background.mode,
          color: pageStyle.background.color,
          from: pageStyle.background.from,
          to: pageStyle.background.to,
          angle: pageStyle.background.angle,
        });
      } else {
        setPageBackground({
          mode: "solid",
          color: "#ffffff",
          from: "#f8fafc",
          to: "#e2e8f0",
          angle: 180,
        });
      }
      const cardsFromDb = rows.map((r) => {
        const card = rowToCard(r);
        return { ...card, type: card.type as CardType };
      });
      const cards = migrateCardsForEditor(cardsFromDb);

      if (cards.length > 0) {
        setCards(cards);
        selectCard(cards[0]?.id ?? null);
        setAutosaveStatus({ isSaving: false, lastSavedAt: Date.now() });
        if (fromTemplate) {
          highlightFromTemplate(cards.map((c) => c.id));
          router.replace(`/editor/${pageId}`, { scroll: false });
        }
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
  }, [pageId, fromTemplate, router, setCards, selectCard, setAutosaveStatus, setPageBackground, highlightFromTemplate]);

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
