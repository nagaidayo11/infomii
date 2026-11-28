import type { CardType, EditorCard } from "@/components/editor/types";
import { readHeroLayout } from "@/lib/editor/hero-layout";

const LIST_ROW_PX: Partial<Record<CardType, { base: number; row: number }>> = {
  accordion_info: { base: 36, row: 52 },
  faq: { base: 36, row: 52 },
  dayTimeline: { base: 40, row: 58 },
  steps: { base: 36, row: 48 },
  checklist: { base: 36, row: 44 },
  iconAccordion: { base: 48, row: 44 },
  pageLinks: { base: 40, row: 40 },
  tabs_info: { base: 96, row: 0 },
  progress_steps: { base: 40, row: 36 },
};

function listItemCount(card: EditorCard): number | null {
  const content = card.content as Record<string, unknown> | undefined;
  if (!content) return null;
  if (Array.isArray(content.items)) return content.items.length;
  if (Array.isArray(content.tabs)) return content.tabs.length;
  return null;
}

/** Default canvas height that shrinks when the operator removes inner sections. */
export function listAwareDefaultHeight(card: EditorCard, fallback: number): number {
  const spec = LIST_ROW_PX[card.type];
  if (!spec) return fallback;
  const n = listItemCount(card);
  if (n == null) return fallback;
  return spec.base + Math.max(0, n) * spec.row;
}

/**
 * Default canvas height that also follows layout / variant switches
 * (hero overlay vs 帯付き, story band overlay vs below, etc.).
 */
export function contentAwareDefaultHeight(card: EditorCard, fallback: number): number {
  const content = card.content as Record<string, unknown> | undefined;

  if (card.type === "hero") {
    const layout = readHeroLayout(content?.layout);
    const overlayAlign = content?.overlayAlign === "center" ? "center" : "bottom";
    const photo = layout === "overlay" && overlayAlign === "center" ? 176 : 168;
    if (layout === "stack") return photo + 76;
    if (layout === "split") return photo + 68;
    return photo;
  }

  if (card.type === "storyBand") {
    if (content?.size === "tall") return 420;
    if (content?.overlay === false) return 300;
    return 220;
  }

  return listAwareDefaultHeight(card, fallback);
}

/** Signature of content that should remeasure auto-height when it changes. */
export function cardHeightSignature(card: EditorCard): string {
  const content = (card.content ?? {}) as Record<string, unknown>;
  const items = content.items;
  const tabs = content.tabs;
  const pins = content.pins;
  const n = Array.isArray(items)
    ? items.length
    : Array.isArray(tabs)
      ? tabs.length
      : Array.isArray(pins)
        ? pins.length
        : "";
  return [
    card.id,
    card.type,
    n,
    content.layout ?? "",
    content.styleVariant ?? "",
    content.overlayAlign ?? "",
    content.overlay === false ? "0" : "1",
    content.columns ?? "",
    content.size ?? "",
  ].join(":");
}
