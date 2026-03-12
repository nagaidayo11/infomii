import type { PageBlock } from "@/components/page-editor/types";

/**
 * GuestPageRenderer expects stable React keys — JSON from API may omit id.
 * Assigns fallback ids so preview works with raw JSON arrays.
 */
export function normalizeBlocksForPreview(blocks: unknown): PageBlock[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((item, index) => {
    if (!item || typeof item !== "object" || !("type" in item)) {
      return null;
    }
    const b = item as PageBlock & { id?: string };
    if (b.id && typeof b.id === "string") return b as PageBlock;
    return { ...b, id: `preview-${index}-${String(b.type)}` } as PageBlock;
  }).filter((b): b is PageBlock => b != null);
}
