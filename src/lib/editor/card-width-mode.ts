import type { EditorCard } from "@/components/editor/types";

export type CardWidthMode = "inset" | "full";

/** Default is inset (with page gutter). Explicit `"full"` is edge-to-edge. */
export function readCardWidthMode(content: unknown): CardWidthMode {
  if (!content || typeof content !== "object") return "inset";
  return (content as { widthMode?: unknown }).widthMode === "full" ? "full" : "inset";
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
