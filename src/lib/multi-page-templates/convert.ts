import { nanoid } from "nanoid";
import type { InformationBlock } from "@/types/information";
import type { TemplateBlock, TemplatePage } from "./types";

function blockId(): string {
  return nanoid(8);
}

/**
 * Converts template blocks to InformationBlock[] for storage (informations table).
 */
export function templatePageToInformationBlocks(page: TemplatePage): InformationBlock[] {
  const blocks: InformationBlock[] = [];
  for (const b of page.blocks) {
    switch (b.type) {
      case "title":
        blocks.push({
          id: blockId(),
          type: "title",
          text: b.content,
          textWeight: "semibold",
          textSize: "lg",
        });
        break;
      case "text":
        blocks.push({
          id: blockId(),
          type: "paragraph",
          text: b.content,
        });
        break;
      case "image":
        blocks.push({
          id: blockId(),
          type: "image",
          url: b.src,
          spacing: "md",
        });
        break;
      case "button":
        blocks.push({
          id: blockId(),
          type: "cta",
          ctaLabel: b.label,
          ctaUrl: b.href ?? "#",
        });
        break;
      case "icon":
        blocks.push({
          id: blockId(),
          type: "icon",
          icon: "info",
          description: b.label ?? "",
          iconSize: "lg",
        });
        break;
      default:
        break;
    }
  }
  return blocks;
}
