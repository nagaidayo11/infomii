/** Bump when marketplace `SEED_TEMPLATES` cards change (forces client refresh). */
export const MARKETPLACE_SEED_VERSION = 11;

type TemplateCardLike = { type: string; order?: number };

/** Opening block types that may stand in for hero when a template has no hero card. */
const OPENING_BLOCK_TYPES = new Set(["hero", "welcome", "heading_body"]);

/**
 * Place pageLinks immediately below the page opening block (hero, or welcome / heading_body).
 * For notice-first templates (e.g. rainy-day), pageLinks follows the first notice when no hero exists.
 */
export function ensurePageLinksAfterOpening<T extends TemplateCardLike>(cards: T[]): T[] {
  const pageLinksIndex = cards.findIndex((card) => card.type === "pageLinks");
  if (pageLinksIndex < 0) return cards;

  let openingIndex = cards.findIndex((card) => card.type === "hero");
  if (openingIndex < 0) {
    openingIndex = cards.findIndex((card) => OPENING_BLOCK_TYPES.has(card.type));
  }
  if (openingIndex < 0 && cards[0]?.type === "notice") {
    openingIndex = 0;
  }
  if (openingIndex < 0) return cards;

  const desiredIndex = openingIndex + 1;
  if (pageLinksIndex === desiredIndex) return cards;

  const next = [...cards];
  const [pageLinksCard] = next.splice(pageLinksIndex, 1);
  const insertAt = pageLinksIndex < desiredIndex ? desiredIndex - 1 : desiredIndex;
  next.splice(insertAt, 0, pageLinksCard);
  return next;
}

export function stripDeprecatedIconCards<T extends { type: string }>(cards: T[]): T[] {
  return cards.filter((card) => card.type !== "icon");
}

export function templateCardsContainIcon(cards: unknown): boolean {
  if (!Array.isArray(cards)) return false;
  return cards.some(
    (card) => card && typeof card === "object" && (card as { type?: string }).type === "icon",
  );
}
