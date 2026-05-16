/** Bump when marketplace `SEED_TEMPLATES` cards change (forces client refresh). */
export const MARKETPLACE_SEED_VERSION = 4;

export function stripDeprecatedIconCards<T extends { type: string }>(cards: T[]): T[] {
  return cards.filter((card) => card.type !== "icon");
}

export function templateCardsContainIcon(cards: unknown): boolean {
  if (!Array.isArray(cards)) return false;
  return cards.some(
    (card) => card && typeof card === "object" && (card as { type?: string }).type === "icon",
  );
}
