import type { ItineraryBlock, ItineraryCard, ItineraryCategory } from "@/types/itinerary";
import type { InformationBlock, InformationRow } from "@/types/information";
import { contentBlocksToDraftBlocks } from "@/lib/draft-to-blocks";
import { draftBlocksToTimelineBlocks } from "@/lib/draft-preview";
import { blocksToImages, normalizeContentBlocks } from "@/lib/normalize-blocks";

import { IMG } from "@/data/sample-images";

const DEFAULT_COVER = IMG.kyotoCover;

function inferCategory(title: string, blocks: InformationBlock[]): ItineraryCategory {
  const hay = `${title} ${blocks.map((b) => b.text ?? b.sectionTitle ?? "").join(" ")}`.toLowerCase();
  if (hay.includes("推し") || hay.includes("聖地") || hay.includes("グッズ")) return "oshi";
  if (hay.includes("ライブ") || hay.includes("コンサート") || hay.includes("arena") || hay.includes("アリーナ")) {
    return "live";
  }
  if (hay.includes("祭") || hay.includes("フェス") || hay.includes("花火") || hay.includes("イベント")) {
    return "event";
  }
  if (hay.includes("グルメ") || hay.includes("食べ") || hay.includes("レストラン") || hay.includes("料理")) {
    return "gourmet";
  }
  if (hay.includes("仲間") || hay.includes("グループ") || hay.includes("分担") || hay.includes("合流")) {
    return "group";
  }
  if (hay.includes("hotel") || hay.includes("宿") || hay.includes("check-in") || hay.includes("チェックイン")) {
    return "hotel";
  }
  if (hay.includes("サウナ") || hay.includes("温泉")) return "wellness";
  if (hay.includes("日帰り") || hay.includes("週末") || hay.includes("day trip")) {
    return "daytrip";
  }
  if (hay.includes("cafe") || hay.includes("カフェ") || hay.includes("おでかけ")) {
    return "local";
  }
  return "travel";
}

export function mapInformationToCard(row: InformationRow): ItineraryCard {
  const blocks = normalizeContentBlocks(row.content_blocks, row.body);
  const imageUrls = blocksToImages(blocks);
  const coverImage = imageUrls[0] ?? row.images[0] ?? DEFAULT_COVER;
  const drafts = contentBlocksToDraftBlocks(blocks, row.title);
  const timeline: ItineraryBlock[] =
    blocks.length > 0 ? draftBlocksToTimelineBlocks(drafts) : [{ id: "hero-fallback", type: "hero", title: row.title, subtitle: row.body }];
  const scheduleCount = timeline.find((b) => b.type === "schedule")?.scheduleItems?.length ?? 0;
  const nearbyCount = timeline.find((b) => b.type === "nearby")?.nearby?.length ?? 0;
  const stepsCount =
    timeline.reduce((n, b) => n + (b.type === "steps" ? (b.steps?.length ?? 0) : 0), 0) || 0;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.body.slice(0, 80) || blocks.find((b) => b.type === "paragraph")?.text?.slice(0, 80) || "",
    coverImage,
    category: inferCategory(row.title, blocks),
    location: "日本",
    duration: row.status === "published" ? "公開中" : "下書き",
    stops: scheduleCount + nearbyCount + stepsCount || blocks.length,
    blocks: timeline,
    source: "remote",
    status: row.status,
    hotelId: row.hotel_id,
  };
}
