import type { DraftBlock, ItineraryBlockType } from "@/types/itinerary";

export const LIST_BLOCK_TYPES: ItineraryBlockType[] = [
  "schedule",
  "checklist",
  "nearby",
  "steps",
  "gallery",
  "pricing",
];

export function isListBlockType(type: ItineraryBlockType): boolean {
  return LIST_BLOCK_TYPES.includes(type);
}

export function listBlockRowCount(block: DraftBlock): number {
  switch (block.type) {
    case "schedule":
      return block.scheduleItems?.length ?? 0;
    case "checklist":
      return block.checklistItems?.length ?? 0;
    case "nearby":
      return block.nearby?.length ?? 0;
    case "steps":
      return block.steps?.length ?? 0;
    case "gallery":
      return block.galleryItems?.length ?? 0;
    case "pricing":
      return block.pricingItems?.length ?? 0;
    default:
      return 0;
  }
}

export function expandAllListBlocks(blocks: DraftBlock[]): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const block of blocks) {
    if (isListBlockType(block.type)) {
      out[block.id] = true;
    }
  }
  return out;
}
