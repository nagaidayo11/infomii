import type { InformationBlock, InformationBlockType } from "@/types/information";

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
          hoursItems: Array.isArray(block.hoursItems)
            ? block.hoursItems
                .map((entry, i) => {
                  if (!entry || typeof entry !== "object") return null;
                  const row = entry as { id?: string; label?: string; value?: string };
                  return {
                    id: row.id ?? `hours-${i + 1}`,
                    label: row.label ?? "",
                    value: row.value ?? "",
                  };
                })
                .filter((e): e is { id: string; label: string; value: string } => Boolean(e))
            : undefined,
          checklistItems: Array.isArray(block.checklistItems)
            ? block.checklistItems
                .map((entry, i) => {
                  if (!entry || typeof entry !== "object") return null;
                  const row = entry as { id?: string; text?: string };
                  return {
                    id: row.id ?? `check-${i + 1}`,
                    text: row.text ?? "",
                  };
                })
                .filter((e): e is { id: string; text: string } => Boolean(e))
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
    .filter((b) => b.type === "paragraph" || b.type === "title" || b.type === "heading")
    .map((b) => b.text ?? b.sectionBody ?? "")
    .filter(Boolean)
    .join("\n\n");
}

export function blocksToImages(blocks: InformationBlock[]): string[] {
  return blocks
    .filter((b) => b.type === "image" && b.url)
    .map((b) => b.url as string);
}
