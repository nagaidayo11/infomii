"use client";

import { useMemo } from "react";
import { LocaleProvider } from "@/components/locale-context";
import { EditorLayout } from "./EditorLayout";
import { CardLibrary } from "./CardLibrary";
import { Canvas } from "./Canvas";
import { SettingsPanel } from "./SettingsPanel";
import { useEditor2Store } from "./store";

/**
 * Infomii Editor 2.0 — Card-based CMS editor.
 * 3 columns: Card Library | Live Page Canvas (375px) | Card Settings Panel.
 * エディタでは常に日本語ロケールで表示。多言語データは content の { ja, en, zh, ko } で保存可能。
 */
export function Editor2() {
  const cards = useEditor2Store((s) => s.cards);
  const selectedCardId = useEditor2Store((s) => s.selectedCardId);
  const addCard = useEditor2Store((s) => s.addCard);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const reorderCards = useEditor2Store((s) => s.reorderCards);
  const selectCard = useEditor2Store((s) => s.selectCard);

  const selectedCard = useMemo(
    () => cards.find((c) => c.id === selectedCardId) ?? null,
    [cards, selectedCardId]
  );

  return (
    <LocaleProvider value="ja">
      <EditorLayout
      library={<CardLibrary onAddCard={addCard} />}
      canvas={
        <Canvas
          cards={cards}
          selectedCardId={selectedCardId}
          onSelectCard={selectCard}
          onReorder={reorderCards}
        />
      }
      settings={
        <SettingsPanel card={selectedCard} onUpdate={updateCard} />
      }
    />
    </LocaleProvider>
  );
}
