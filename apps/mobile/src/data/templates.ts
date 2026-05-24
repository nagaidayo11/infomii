import { SAMPLE_ITINERARIES, getItineraryById } from "@/data/sample-itineraries";
import type { DraftBlock, ItineraryBlockType, ItineraryCard } from "@/types/itinerary";

const DRAFT_TYPES: ItineraryBlockType[] = [
  "hero",
  "schedule",
  "checklist",
  "steps",
  "map",
  "nearby",
  "notice",
  "welcome",
];

/** モバイル用テンプレート（Web BtoC seed と同系統のサンプルしおりを流用） */
export function getPopularTemplates(): ItineraryCard[] {
  return SAMPLE_ITINERARIES.filter((i) => i.popular || i.featured);
}

export function getTemplateById(id: string): ItineraryCard | undefined {
  return getItineraryById(id);
}

/** サンプルしおりの blocks を作る画面用 DraftBlock に変換 */
export function templateToDraftBlocks(template: ItineraryCard): DraftBlock[] {
  const out: DraftBlock[] = [];

  for (const block of template.blocks) {
    if (block.type === "image") {
      out.push({
        id: `draft-${block.id}`,
        type: "hero",
        title: block.title ?? "カバー",
        body: block.body ?? "",
      });
      continue;
    }
    if (!DRAFT_TYPES.includes(block.type)) continue;

    let body = block.body ?? block.subtitle ?? "";
    if (block.type === "schedule" && block.scheduleItems?.[0]) {
      const first = block.scheduleItems[0];
      body = `${first.time} ${first.label}`;
    }
    if (block.type === "checklist" && block.checklistItems?.[0]) {
      body = block.checklistItems[0];
    }

    out.push({
      id: `draft-${block.id}`,
      type: block.type,
      title: block.title ?? block.type,
      body,
    });
  }

  if (!out.length) {
    return [
      { id: "draft-hero", type: "hero", title: "カバー", body: template.title },
      { id: "draft-schedule", type: "schedule", title: "タイムライン", body: "" },
    ];
  }

  return out;
}
