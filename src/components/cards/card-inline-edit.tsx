"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useEditor2Store } from "@/components/editor/store";

type CardEditContextValue = {
  inlineEditable: boolean;
};

const CardEditContext = createContext<CardEditContextValue>({ inlineEditable: false });

export function CardEditProvider({
  inlineEditable,
  children,
}: {
  inlineEditable: boolean;
  children: ReactNode;
}) {
  return <CardEditContext.Provider value={{ inlineEditable }}>{children}</CardEditContext.Provider>;
}

/** Canvas 上でタップ即インライン編集（ゲスト表示では false）。 */
export function useCardInlineEdit(cardId: string) {
  const { inlineEditable } = useContext(CardEditContext);
  const selectCard = useEditor2Store((s) => s.selectCard);
  return {
    editable: inlineEditable,
    onActivate: inlineEditable ? () => selectCard(cardId) : undefined,
  };
}
