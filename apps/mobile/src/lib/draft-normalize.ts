import type {
  DraftBlock,
  DraftGalleryItem,
  DraftNearbyItem,
  DraftPricingItem,
  DraftStepItem,
  ScheduleItem,
} from "@/types/itinerary";

/** 旧形式（body のみ）のローカル下書きをリスト型フィールドへ補完 */
export function normalizeDraftBlock(block: DraftBlock): DraftBlock {
  switch (block.type) {
    case "schedule": {
      if (block.scheduleItems?.length) return block;
      const body = block.body?.trim();
      if (!body) {
        return { ...block, scheduleItems: [{ day: "", time: "", label: "" }] };
      }
      const match = body.match(/^(\S+)\s+(\d{1,2}:\d{2})\s+(.+)$/);
      if (match) {
        return {
          ...block,
          scheduleItems: [{ day: match[1], time: match[2], label: match[3] }],
        };
      }
      return {
        ...block,
        scheduleItems: [{ day: "", time: "", label: body }],
      };
    }
    case "checklist": {
      if (block.checklistItems?.length) return block;
      const body = block.body?.trim();
      return {
        ...block,
        checklistItems: body ? [body] : [""],
      };
    }
    case "nearby": {
      if (block.nearby?.length) return block;
      const body = block.body?.trim();
      return {
        ...block,
        nearby: body ? [{ name: "", description: body }] : [{ name: "", description: "" }],
      };
    }
    case "steps": {
      if (block.steps?.length) return block;
      const body = block.body?.trim();
      return {
        ...block,
        steps: body ? [{ title: block.title, description: body }] : [{ title: "", description: "" }],
      };
    }
    case "gallery": {
      if (block.galleryItems?.length) return block;
      return { ...block, galleryItems: [{ url: "", caption: "" }] };
    }
    case "pricing": {
      if (block.pricingItems?.length) return block;
      return { ...block, pricingItems: [{ label: "", value: "" }] };
    }
    case "quote":
      return { ...block, body: block.body ?? "" };
    case "cta":
      return {
        ...block,
        ctaLabel: block.ctaLabel ?? "",
        ctaUrl: block.ctaUrl ?? "",
      };
    case "badge":
      return {
        ...block,
        badgeText: block.badgeText ?? block.title ?? "",
        badgeColor: block.badgeColor ?? "#dcfce7",
        badgeTextColor: block.badgeTextColor ?? "#065f46",
      };
    default:
      return block;
  }
}

export function normalizeDraftBlocks(blocks: DraftBlock[]): DraftBlock[] {
  return blocks.map(normalizeDraftBlock);
}

export function emptyScheduleRow(): ScheduleItem {
  return { day: "", time: "", label: "" };
}

export function emptyNearbyRow(): DraftNearbyItem {
  return { name: "", description: "" };
}

export function emptyStepRow(): DraftStepItem {
  return { title: "", description: "" };
}

export function emptyGalleryRow(): DraftGalleryItem {
  return { url: "", caption: "" };
}

export function emptyPricingRow(): DraftPricingItem {
  return { label: "", value: "" };
}
