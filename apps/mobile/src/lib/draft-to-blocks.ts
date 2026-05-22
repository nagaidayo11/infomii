import type { DraftBlock } from "@/types/itinerary";
import type { InformationBlock } from "@/types/information";

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function draftBlocksToContentBlocks(
  title: string,
  drafts: DraftBlock[],
): InformationBlock[] {
  const blocks: InformationBlock[] = [
    { id: uid("title"), type: "title", text: title },
  ];

  for (const draft of drafts) {
    switch (draft.type) {
      case "hero":
        blocks.push({ id: draft.id, type: "heading", text: draft.title });
        break;
      case "schedule":
        blocks.push({
          id: draft.id,
          type: "hours",
          label: draft.title,
          hoursItems: [
            { id: uid("h"), label: "1日目 10:00", value: "Add your first stop" },
            { id: uid("h"), label: "1日目 14:00", value: "Second stop" },
          ],
        });
        break;
      case "checklist":
        blocks.push({
          id: draft.id,
          type: "checklist",
          label: draft.title,
          checklistItems: [
            { id: uid("c"), text: "Passport / ID" },
            { id: uid("c"), text: "Charger" },
          ],
        });
        break;
      case "steps":
        blocks.push({
          id: draft.id,
          type: "section",
          sectionTitle: draft.title,
          sectionBody: "Step-by-step notes for your day.",
        });
        break;
      case "map":
      case "notice":
        blocks.push({
          id: draft.id,
          type: "paragraph",
          text: `${draft.title}: meeting point and address.`,
        });
        break;
      case "nearby":
        blocks.push({
          id: draft.id,
          type: "section",
          sectionTitle: draft.title,
          sectionBody: "Nearby spots to visit.",
        });
        break;
      case "welcome":
        blocks.push({
          id: draft.id,
          type: "paragraph",
          text: draft.title,
        });
        break;
      default:
        break;
    }
  }

  return blocks;
}
