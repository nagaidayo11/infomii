import type { ItineraryBlock, ItineraryCard, ItineraryCategory } from "@/types/itinerary";
import type { InformationBlock, InformationRow } from "@/types/information";
import { normalizeContentBlocks } from "@/lib/normalize-blocks";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80";

function inferCategory(title: string, blocks: InformationBlock[]): ItineraryCategory {
  const hay = `${title} ${blocks.map((b) => b.text ?? b.sectionTitle ?? "").join(" ")}`.toLowerCase();
  if (hay.includes("hotel") || hay.includes("宿") || hay.includes("check-in") || hay.includes("チェックイン")) {
    return "hotel";
  }
  if (hay.includes("sauna") || hay.includes("サウナ") || hay.includes("温泉")) {
    return "wellness";
  }
  if (hay.includes("cafe") || hay.includes("カフェ") || hay.includes("おでかけ")) {
    return "local";
  }
  return "travel";
}

function mapBlocksToTimeline(blocks: InformationBlock[]): ItineraryBlock[] {
  const out: ItineraryBlock[] = [];
  let heroDone = false;

  for (const block of blocks) {
    if (!heroDone && (block.type === "title" || block.type === "heading")) {
      out.push({
        id: block.id,
        type: "hero",
        title: block.text ?? block.sectionTitle ?? "",
        subtitle: blocks.find((b) => b.type === "paragraph")?.text,
      });
      heroDone = true;
      continue;
    }
    if (block.type === "hours" && block.hoursItems?.length) {
      out.push({
        id: block.id,
        type: "schedule",
        title: block.label ?? "Timeline",
        scheduleItems: block.hoursItems.map((item) => {
          const parts = item.label.split(/\s+/);
          return {
            day: parts[0] ?? "",
            time: item.value,
            label: item.label,
          };
        }),
      });
      continue;
    }
    if (block.type === "checklist" && block.checklistItems?.length) {
      out.push({
        id: block.id,
        type: "checklist",
        title: block.label ?? "Checklist",
        checklistItems: block.checklistItems.map((i) => i.text),
      });
      continue;
    }
    if (block.type === "section") {
      out.push({
        id: block.id,
        type: "steps",
        title: block.sectionTitle ?? "Section",
        steps: [
          {
            title: block.sectionTitle ?? "",
            description: block.sectionBody ?? "",
          },
        ],
      });
      continue;
    }
    if (block.type === "paragraph" && block.text) {
      out.push({
        id: block.id,
        type: "notice",
        title: "Note",
        body: block.text,
      });
    }
  }

  if (!out.length) {
    out.push({ id: "hero-fallback", type: "hero", title: "Itinerary", subtitle: "" });
  }
  return out;
}

export function mapInformationToCard(row: InformationRow): ItineraryCard {
  const blocks = normalizeContentBlocks(row.content_blocks, row.body);
  const imageBlock = blocks.find((b) => b.type === "image" && b.url);
  const coverImage = imageBlock?.url ?? row.images[0] ?? DEFAULT_COVER;
  const timeline = mapBlocksToTimeline(blocks);
  const scheduleCount = timeline.find((b) => b.type === "schedule")?.scheduleItems?.length ?? 0;
  const stepsCount = timeline.filter((b) => b.type === "steps").length;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.body.slice(0, 80) || blocks.find((b) => b.type === "paragraph")?.text?.slice(0, 80) || "",
    coverImage,
    category: inferCategory(row.title, blocks),
    location: "Japan",
    duration: row.status === "published" ? "Published" : "Draft",
    stops: scheduleCount + stepsCount || blocks.length,
    blocks: timeline,
    source: "remote",
    status: row.status,
  };
}
