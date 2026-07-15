import type { EditorCard } from "@/components/editor/types";

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
