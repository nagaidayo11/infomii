"use client";

import { useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { Editor2 } from "@/components/editor";
import { useAutoSaveCards } from "@/components/editor/useAutoSaveCards";
import type { CardType } from "@/components/editor/types";
import { useEditor2Store } from "@/components/editor/store";
import { getPageCards } from "@/lib/storage";

function EditorWithPageId() {
  const params = useParams();
  const pageId = typeof params.id === "string" ? params.id : null;
  const setCards = useEditor2Store((s) => s.setCards);
  const selectCard = useEditor2Store((s) => s.selectCard);

  useAutoSaveCards(pageId);

  useEffect(() => {
    if (!pageId) return;
    getPageCards(pageId).then((rows) => {
      const cards = rows.map((r) => ({
        id: r.id,
        type: r.type as CardType,
        content: r.content ?? {},
        order: r.order,
      }));
      setCards(cards);
      selectCard(cards[0]?.id ?? null);
    });
  }, [pageId, setCards, selectCard]);

  if (!pageId) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        ページが見つかりません
      </div>
    );
  }

  return <Editor2 pageId={pageId} />;
}

/**
 * Canvas-based card editor at /editor/page/[id].
 * Same experience as /editor/v2?pageId=xxx with a clean URL.
 */
export default function EditorPageById() {
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
