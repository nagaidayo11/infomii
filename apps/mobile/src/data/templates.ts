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
        body: block.body ?? block.subtitle ?? "",
      });
      continue;
    }
    if (!DRAFT_TYPES.includes(block.type)) continue;

    const draft: DraftBlock = {
      id: `draft-${block.id}`,
      type: block.type,
      title: block.title ?? block.type,
      body: block.body ?? block.subtitle ?? "",
    };

    if (block.type === "schedule" && block.scheduleItems?.length) {
      draft.scheduleItems = block.scheduleItems.map((item) => ({ ...item }));
    }
    if (block.type === "checklist" && block.checklistItems?.length) {
      draft.checklistItems = [...block.checklistItems];
    }
    if (block.type === "nearby" && block.nearby?.length) {
      draft.nearby = block.nearby.map((p) => ({ ...p }));
    }
    if (block.type === "steps" && block.steps?.length) {
      draft.steps = block.steps.map((s) => ({ ...s }));
    }

    out.push(draft);
  }

  if (!out.length) {
    return [
      { id: "draft-hero", type: "hero", title: "カバー", body: template.title },
      {
        id: "draft-schedule",
        type: "schedule",
        title: "タイムライン",
        scheduleItems: [{ day: "", time: "", label: "" }],
      },
    ];
  }

  return out;
}
