import type { DraftBlock, ItineraryBlock } from "@/types/itinerary";
import { normalizeDraftBlock } from "@/lib/draft-normalize";

/** DraftBlock を TimelineView 用 ItineraryBlock に直接変換（プレビュー用・欠落なし） */
export function draftBlocksToTimelineBlocks(drafts: DraftBlock[]): ItineraryBlock[] {
  return drafts.map((raw) => {
    const draft = normalizeDraftBlock(raw);
    const base = {
      id: draft.id,
      type: draft.type,
      title: draft.title,
      body: draft.body,
      imageUrl: draft.imageUrl,
      quoteAuthor: draft.quoteAuthor,
      galleryItems: draft.galleryItems,
      pricingItems: draft.pricingItems,
      ctaLabel: draft.ctaLabel,
      ctaUrl: draft.ctaUrl,
      badgeText: draft.badgeText,
      badgeColor: draft.badgeColor,
      badgeTextColor: draft.badgeTextColor,
    };

    switch (draft.type) {
      case "schedule":
        return {
          ...base,
          scheduleItems:
            draft.scheduleItems?.length ?
              draft.scheduleItems
            : [{ day: "", time: "", label: draft.body ?? "" }],
        };
      case "checklist":
        return {
          ...base,
          checklistItems:
            draft.checklistItems?.length ? draft.checklistItems : draft.body ? [draft.body] : [],
        };
      case "nearby":
        return {
          ...base,
          nearby:
            draft.nearby?.length ?
              draft.nearby
            : [{ name: draft.title, description: draft.body ?? "" }],
        };
      case "steps":
        return {
          ...base,
          steps:
            draft.steps?.length ?
              draft.steps
            : [{ title: draft.title, description: draft.body ?? "" }],
        };
      case "hero":
        return {
          ...base,
          subtitle: draft.body,
          imageUrl: draft.imageUrl,
        };
      case "gallery":
        return {
          ...base,
          galleryItems: draft.galleryItems?.filter((g) => g.url.trim()) ?? [],
        };
      case "pricing":
        return {
          ...base,
          pricingItems: draft.pricingItems?.length ? draft.pricingItems : [{ label: "", value: "" }],
        };
      case "badge":
        return {
          ...base,
          badgeText: draft.badgeText ?? draft.title,
        };
      case "cta":
        return {
          ...base,
          ctaLabel: draft.ctaLabel ?? draft.title,
          ctaUrl: draft.ctaUrl,
        };
      case "quote":
        return {
          ...base,
          body: draft.body,
          quoteAuthor: draft.quoteAuthor,
        };
      default:
        return base;
    }
  });
}

export function draftToPreviewBlocks(title: string, drafts: DraftBlock[]): ItineraryBlock[] {
  void title;
  return draftBlocksToTimelineBlocks(drafts);
}
