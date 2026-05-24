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
    const note = draft.body?.trim();
    switch (draft.type) {
      case "hero":
        blocks.push({
          id: draft.id,
          type: "heading",
          text: note || draft.title,
        });
        if (note && note !== draft.title) {
          blocks.push({ id: uid("sub"), type: "paragraph", text: draft.title });
        }
        break;
      case "schedule":
        blocks.push({
          id: draft.id,
          type: "hours",
          label: draft.title,
          hoursItems: [
            {
              id: uid("h"),
              label: "1日目",
              value: note || "10:00 最初の予定を入力",
            },
          ],
        });
        break;
      case "checklist":
        blocks.push({
          id: draft.id,
          type: "checklist",
          label: draft.title,
          checklistItems: [{ id: uid("c"), text: note || "持ち物を入力" }],
        });
        break;
      case "steps":
        blocks.push({
          id: draft.id,
          type: "section",
          sectionTitle: draft.title,
          sectionBody: note || "ステップの内容を入力",
        });
        break;
      case "map":
      case "notice":
      case "welcome":
        blocks.push({
          id: draft.id,
          type: "paragraph",
          text: note ? `${draft.title}: ${note}` : `${draft.title}の内容を入力`,
        });
        break;
      case "nearby":
        blocks.push({
          id: draft.id,
          type: "section",
          sectionTitle: draft.title,
          sectionBody: note || "スポット名とメモを入力",
        });
        break;
      default:
        break;
    }
  }

  return blocks;
}
