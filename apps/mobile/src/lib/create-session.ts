import type { EditorCard } from "@/types/editor-card";

/** 作る画面のインメモリ下書き（cards 正本） */
export type CreateSession = {
  title: string;
  pageId: string;
  slug: string;
  informationId?: string;
  cards: EditorCard[];
};

let session: CreateSession | null = null;

function cloneCards(cards: EditorCard[]): EditorCard[] {
  return JSON.parse(JSON.stringify(cards)) as EditorCard[];
}

export function setCreateSession(data: CreateSession): void {
  session = {
    ...data,
    cards: cloneCards(data.cards),
  };
}

export function getCreateSession(): CreateSession | null {
  if (!session) return null;
  return { ...session, cards: cloneCards(session.cards) };
}

export function clearCreateSession(): void {
  session = null;
}
