import { draftBlocksToContentBlocks } from "@/lib/draft-to-blocks";
import { mapInformationToCard } from "@/lib/map-information";
import type { DraftBlock, ItineraryBlock } from "@/types/itinerary";

export function draftToPreviewBlocks(title: string, drafts: DraftBlock[]): ItineraryBlock[] {
  const content = draftBlocksToContentBlocks(title, drafts);
  const card = mapInformationToCard({
    id: "local-preview",
    hotel_id: null,
    title,
    body: "",
    images: [],
    content_blocks: content,
    status: "draft",
    slug: "local-preview",
    updated_at: new Date().toISOString(),
  });
  return card.blocks;
}
