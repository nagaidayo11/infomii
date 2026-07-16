import type { EditorCard } from "@/components/editor/types";
import { isMediaCardType } from "@/components/editor/types";

export type CardWidthMode = "inset" | "full";

function coerceWidthModeToken(value: unknown): CardWidthMode | null {
  if (value === "full" || value === "inset") return value;
  // Batch-translate used to wrap enum strings as { ja, en, zh, ko }.
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      if (entry === "full" || entry === "inset") return entry;
    }
  }
  return null;
}

/** Default is inset (with page gutter). Explicit `"full"` is edge-to-edge. */
export function readCardWidthMode(content: unknown): CardWidthMode {
  if (!content || typeof content !== "object") return "inset";
  return coerceWidthModeToken((content as { widthMode?: unknown }).widthMode) ?? "inset";
}

/** Heal corrupted / missing widthMode into a plain enum string before persist. */
export function normalizeCardWidthModeContent(
  type: string,
  content: Record<string, unknown>,
): Record<string, unknown> {
  if (type !== "hero" && type !== "hero_slider") return content;
  const mode = readCardWidthMode(content);
  if (content.widthMode === mode) return content;
  return { ...content, widthMode: mode };
}

export function isCardFullBleed(card: Pick<EditorCard, "type" | "content">): boolean {
  if (card.type !== "hero" && card.type !== "hero_slider") return false;
  return readCardWidthMode(card.content) === "full";
}

/**
 * Prefer positive inset margins over negative-margin “breakout”
 * (which gets clipped by overflow-x-hidden phone frames).
 * Margin lives in `.card-content-inset` (globals.css) so Tailwind
 * need not parse `var(..., fallback)` commas in arbitrary classes.
 */
export const CARD_INSET_GUTTER_CLASS = "card-content-inset";

export const CARD_FULL_BLEED_CLASS = "card-full-bleed w-full max-w-none";

/** Info / default inset surface (radius + light border/shadow). */
export const GUEST_CARD_SURFACE_CLASS = "guest-card-surface";

/** Media / live-ops: outer radius only — fill/border stay on the block. */
export const GUEST_CARD_SURFACE_MEDIA_CLASS = "guest-card-surface-media";

/** Shared inner padding (`--guest-card-pad-x` / `--guest-card-pad-y`). */
export const GUEST_CARD_PAD_CLASS = "guest-card-pad";

/** Slightly tighter vertical pad (`--guest-card-pad-y-sm`). */
export const GUEST_CARD_PAD_SM_CLASS = "guest-card-pad-sm";

/** Vertical stack gap between guest cards (`--guest-stack-gap`). */
export const GUEST_CARD_STACK_CLASS = "guest-card-stack";

/** Flush / full-bleed stacks (`--guest-stack-gap-flush`). */
export const GUEST_CARD_STACK_FLUSH_CLASS = "guest-card-stack guest-card-stack-flush";

const LAYOUT_ONLY_CARD_TYPES = new Set(["space", "divider"]);

const STATUS_BAND_CARD_TYPES = new Set(["breakfast_crowd", "dinner_crowd", "spa_crowd"]);

/**
 * Width + surface chrome for a guest card wrapper.
 * Full-bleed: edge-to-edge square. Layout-only: gutter only.
 * Media / live-ops: gutter + radius. Info/default: gutter + surface.
 */
export function guestCardChromeClass(card: Pick<EditorCard, "type" | "content">): string {
  if (isCardFullBleed(card)) return CARD_FULL_BLEED_CLASS;
  if (LAYOUT_ONLY_CARD_TYPES.has(card.type)) return CARD_INSET_GUTTER_CLASS;
  if (isMediaCardType(card.type) || STATUS_BAND_CARD_TYPES.has(card.type)) {
    return `${CARD_INSET_GUTTER_CLASS} ${GUEST_CARD_SURFACE_MEDIA_CLASS}`;
  }
  return `${CARD_INSET_GUTTER_CLASS} ${GUEST_CARD_SURFACE_CLASS}`;
}
