"use client";

import { useMemo } from "react";
import { EditorLayout } from "./EditorLayout";
import { CardLibrary } from "./CardLibrary";
import { Canvas } from "./Canvas";
import { SettingsPanel } from "./SettingsPanel";
import { useEditor2Store } from "./store";

/**
 * Infomii Editor 2.0 — Card-based CMS editor.
 * 3 columns: Card Library | Live Page Canvas (375px) | Card Settings Panel.
 * When card order changes, reorderCards() updates local state; persist to Supabase in your app (e.g. subscribe to store or pass onOrderChange).
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
  );
}
