/** Bump when marketplace `SEED_TEMPLATES` cards change (forces client refresh). */
export const MARKETPLACE_SEED_VERSION = 29;

/** Default grid columns for pageLinks blocks in marketplace templates. */
export const PAGE_LINKS_DEFAULT_COLUMNS = 2;

function readPageLinksColumns(value: unknown): 1 | 2 | 3 | 4 {
  const raw = typeof value === "number" ? value : Number(value);
  return raw === 1 || raw === 2 || raw === 3 || raw === 4 ? raw : PAGE_LINKS_DEFAULT_COLUMNS;
}

export function normalizePageLinksCardContent(
  content: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...content,
    columns: readPageLinksColumns(content.columns),
    iconSize: content.iconSize ?? "md",
    styleVariant: content.styleVariant ?? "tile",
    tileShadowStrength: content.tileShadowStrength ?? "md",
    circleIconShadowStrength: content.circleIconShadowStrength ?? "md",
    accentColor: content.accentColor ?? "#0f766e",
  };
}

function normalizeItemsWithoutDeadScheduleIcons(items: unknown): unknown {
  if (!Array.isArray(items)) return items;
  return items.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return item;
    const rest = { ...(item as Record<string, unknown>) };
    delete rest.icon;
    return rest;
  });
}

function normalizeColumns(value: unknown, fallback: 2 | 3 = 2): 2 | 3 {
  const raw = typeof value === "number" ? value : Number(value);
  return raw === 2 || raw === 3 ? raw : fallback;
}

function withAccent(content: Record<string, unknown>): Record<string, unknown> {
  return {
    ...content,
    accentColor: content.accentColor ?? "#0f766e",
  };
}

export function normalizeMarketplaceSeedCardContent(
  type: string,
  content: Record<string, unknown>,
): Record<string, unknown> {
  const base = { ...(content ?? {}) };
  switch (type) {
    case "hero":
      return {
        ...withAccent(base),
        layout: base.layout ?? "overlay",
        widthMode: base.widthMode ?? "full",
      };
    case "hero_slider":
      return {
        ...base,
        widthMode: base.widthMode ?? "full",
        height: base.height ?? "s",
        autoplay: base.autoplay ?? true,
        transitionEnabled: base.transitionEnabled ?? true,
        transitionType: base.transitionType ?? "fade",
      };
    case "pageLinks":
    case "icon_shortcuts":
      return normalizePageLinksCardContent(base);
    case "heading_body":
      return {
        ...base,
        dividerStyle: base.dividerStyle ?? "solid",
      };
    case "sectionTitle":
    case "storyBand":
    case "dayTimeline":
    case "tabs_info":
    case "accordion_info":
    case "iconAccordion":
    case "map":
      return withAccent(base);
    case "schedule":
      return {
        ...base,
        dynamicEnabled: base.dynamicEnabled ?? false,
        timezone: base.timezone ?? "Asia/Tokyo",
        rules: Array.isArray(base.rules) ? base.rules : [],
        items: normalizeItemsWithoutDeadScheduleIcons(base.items),
      };
    case "checklist":
      return {
        ...base,
        items: Array.isArray(base.items)
          ? base.items.map((item) => {
              if (item && typeof item === "object" && !Array.isArray(item)) {
                return { checked: false, ...(item as Record<string, unknown>) };
              }
              return { text: String(item ?? ""), checked: false };
            })
          : [],
      };
    case "gallery":
    case "image_tiles":
      return {
        ...base,
        columns: normalizeColumns(base.columns, 2),
      };
    case "open_status":
      return {
        ...base,
        mode: base.mode ?? "manual",
        openNow: base.openNow ?? true,
      };
    case "notice":
      return {
        ...base,
        variant: base.variant ?? "info",
      };
    default:
      return base;
  }
}

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
