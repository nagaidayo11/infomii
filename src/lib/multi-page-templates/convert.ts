import { nanoid } from "nanoid";
import type { InformationBlock } from "@/types/information";
import type { TemplateBlock, TemplatePage } from "./types";

function blockId(): string {
  return nanoid(8);
}

function normalizeTemplateIcon(icon: string | undefined): string {
  const raw = (icon ?? "").trim().toLowerCase();
  if (!raw) return "svg:info";
  const map: Record<string, string> = {
    wifi: "svg:wifi",
    "📶": "svg:wifi",
    breakfast: "svg:utensils",
    "🍽️": "svg:utensils",
    "🍽": "svg:utensils",
    checkout: "svg:clock",
    "⏰": "svg:clock",
    "🕐": "svg:clock",
    map: "svg:map-pin",
    nearby: "svg:map-pin",
    "📍": "svg:map-pin",
    parking: "svg:car",
    "🅿️": "svg:car",
    taxi: "svg:taxi",
    "🚕": "svg:taxi",
    laundry: "svg:washing-machine",
    "🧺": "svg:washing-machine",
    emergency: "svg:phone",
    "🚨": "svg:phone",
    spa: "svg:bath",
    "♨️": "svg:bath",
    notice: "svg:bell",
    "📢": "svg:bell",
    key: "svg:key",
    "🔑": "svg:key",
  };
  return map[raw] ?? (raw.startsWith("svg:") ? raw : "svg:info");
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
      case "heading":
        blocks.push({
          id: blockId(),
          type: "heading",
          text: b.content,
          textWeight: "semibold",
          textSize: "md",
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
          icon: normalizeTemplateIcon(b.icon),
          description: b.label ?? "",
          iconSize: "lg",
        });
        break;
      case "section":
        blocks.push({
          id: blockId(),
          type: "section",
          sectionTitle: b.title,
          sectionBody: b.body,
          cardRadius: "lg",
        });
        break;
      case "iconRow":
        blocks.push({
          id: blockId(),
          type: "iconRow",
          cardRadius: "full",
          iconItems: b.items.map((item, idx) => ({
            id: `icon-item-${idx + 1}`,
            icon: normalizeTemplateIcon(item.icon),
            label: item.label,
            link: item.link ?? "",
            backgroundColor: "#ffffff",
          })),
        });
        break;
      case "checklist":
        blocks.push({
          id: blockId(),
          type: "checklist",
          checklistItems: b.items.map((text, idx) => ({ id: `check-${idx + 1}`, text })),
        });
        break;
      case "hours":
        blocks.push({
          id: blockId(),
          type: "hours",
          hoursItems: b.items.map((item, idx) => ({ id: `hours-${idx + 1}`, label: item.label, value: item.value })),
        });
        break;
      case "pricing":
        blocks.push({
          id: blockId(),
          type: "pricing",
          pricingItems: b.items.map((item, idx) => ({
            id: `pricing-${idx + 1}`,
            label: item.label,
            value: item.value,
          })),
        });
        break;
      case "quote":
        blocks.push({
          id: blockId(),
          type: "quote",
          text: b.text,
          quoteAuthor: b.author ?? "",
        });
        break;
      default:
        break;
    }
  }
  return blocks;
}
