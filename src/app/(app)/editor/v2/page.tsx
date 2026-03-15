"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Editor2 } from "@/components/editor";
import type { CardType } from "@/components/editor/types";
import { useEditor2Store } from "@/components/editor/store";
import { getPageCards } from "@/lib/storage";

function Editor2WithPageId() {
  const searchParams = useSearchParams();
  const pageId = searchParams.get("pageId");
  const setCards = useEditor2Store((s) => s.setCards);
  const selectCard = useEditor2Store((s) => s.selectCard);

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

  return <Editor2 />;
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
