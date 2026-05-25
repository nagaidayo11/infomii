import type { GalleryItem, InformationBlock, InformationBlockType } from "@/types/information";

const BLOCK_TYPES: InformationBlockType[] = [
  "title",
  "heading",
  "paragraph",
  "image",
  "divider",
  "icon",
  "space",
  "section",
  "columns",
  "iconRow",
  "cta",
  "badge",
  "hours",
  "pricing",
  "quote",
  "checklist",
  "gallery",
  "columnGroup",
];

function mapKeyValueItems(raw: unknown, prefix: string) {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((entry, i) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as { id?: string; label?: string; value?: string; description?: string };
      return {
        id: row.id ?? `${prefix}-${i + 1}`,
        label: row.label ?? "",
        value: row.value ?? "",
        ...(typeof row.description === "string" ? { description: row.description } : {}),
      };
    })
    .filter((e): e is { id: string; label: string; value: string; description?: string } => Boolean(e));
}

export function normalizeContentBlocks(value: unknown, fallbackBody: string): InformationBlock[] {
  if (Array.isArray(value) && value.length > 0) {
    return value
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const block = item as Partial<InformationBlock>;
        if (!block.type || !BLOCK_TYPES.includes(block.type)) return null;
        return {
          id: typeof block.id === "string" && block.id ? block.id : `block-${index + 1}`,
          type: block.type,
          text: typeof block.text === "string" ? block.text : undefined,
          url: typeof block.url === "string" ? block.url : undefined,
          label: typeof block.label === "string" ? block.label : undefined,
          description: typeof block.description === "string" ? block.description : undefined,
          sectionTitle: typeof block.sectionTitle === "string" ? block.sectionTitle : undefined,
          sectionBody: typeof block.sectionBody === "string" ? block.sectionBody : undefined,
          quoteAuthor: typeof block.quoteAuthor === "string" ? block.quoteAuthor : undefined,
          ctaLabel: typeof block.ctaLabel === "string" ? block.ctaLabel : undefined,
          ctaUrl: typeof block.ctaUrl === "string" ? block.ctaUrl : undefined,
          badgeText: typeof block.badgeText === "string" ? block.badgeText : undefined,
          badgeColor: typeof block.badgeColor === "string" ? block.badgeColor : undefined,
          badgeTextColor: typeof block.badgeTextColor === "string" ? block.badgeTextColor : undefined,
          textColor: typeof block.textColor === "string" ? block.textColor : undefined,
          hoursItems: mapKeyValueItems(block.hoursItems, "hours"),
          pricingItems: mapKeyValueItems(block.pricingItems, "pricing"),
          checklistItems: Array.isArray(block.checklistItems)
            ? block.checklistItems
                .map((entry, i) => {
                  if (!entry || typeof entry !== "object") return null;
                  const row = entry as { id?: string; text?: string };
                  return { id: row.id ?? `check-${i + 1}`, text: row.text ?? "" };
                })
                .filter((e): e is { id: string; text: string } => Boolean(e))
            : undefined,
          galleryItems: Array.isArray(block.galleryItems)
            ? (block.galleryItems
                .map((entry, i) => {
                  if (!entry || typeof entry !== "object") return null;
                  const row = entry as { id?: string; url?: string; caption?: string };
                  if (!row.url) return null;
                  const item: GalleryItem = {
                    id: row.id ?? `gallery-${i + 1}`,
                    url: row.url,
                  };
                  if (typeof row.caption === "string") item.caption = row.caption;
                  return item;
                })
                .filter(Boolean) as GalleryItem[])
            : undefined,
        };
      })
      .filter((b) => b !== null) as InformationBlock[];
  }

  if (fallbackBody.trim()) {
    return [{ id: "block-1", type: "paragraph", text: fallbackBody }];
  }
  return [];
}

export function blocksToBody(blocks: InformationBlock[]): string {
  return blocks
    .filter((b) => b.type === "paragraph" || b.type === "title" || b.type === "heading" || b.type === "quote")
    .map((b) => b.text ?? b.sectionBody ?? "")
    .filter(Boolean)
    .join("\n\n");
}

export function blocksToImages(blocks: InformationBlock[]): string[] {
  const urls: string[] = [];
  for (const b of blocks) {
    if (b.type === "image" && b.url) urls.push(b.url);
    if (b.type === "gallery" && b.galleryItems) {
      for (const g of b.galleryItems) {
        if (g.url) urls.push(g.url);
      }
    }
  }
  return [...new Set(urls)];
}
