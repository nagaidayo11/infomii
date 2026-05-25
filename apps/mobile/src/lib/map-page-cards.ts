import type { ItineraryBlock, ItineraryCard, ItineraryCategory } from "@/types/itinerary";
import type { EditorCard } from "@/types/editor-card";
import { cardTypeLabel, isBusinessOnlyCard } from "@/types/editor-card";
import { APP_PUBLIC_URL } from "@/lib/config";

import { IMG } from "@/data/sample-images";

const DEFAULT_COVER = IMG.kyotoCover;

function inferCategory(title: string, cards: EditorCard[]): ItineraryCategory {
  const hay = `${title} ${cards.map((c) => JSON.stringify(c.content)).join(" ")}`.toLowerCase();
  if (hay.includes("推し") || hay.includes("聖地")) return "oshi";
  if (hay.includes("ライブ") || hay.includes("コンサート")) return "live";
  if (hay.includes("祭") || hay.includes("フェス")) return "event";
  if (hay.includes("グルメ") || hay.includes("食べ")) return "gourmet";
  if (hay.includes("仲間") || hay.includes("グループ")) return "group";
  if (hay.includes("宿") || hay.includes("hotel")) return "hotel";
  if (hay.includes("サウナ") || hay.includes("温泉")) return "wellness";
  if (hay.includes("日帰り")) return "daytrip";
  if (hay.includes("カフェ")) return "local";
  return "travel";
}

function resolveImage(src: unknown): string | undefined {
  if (typeof src !== "string" || !src.trim()) return undefined;
  if (src.startsWith("http") || src.startsWith("file://")) return src;
  return `${APP_PUBLIC_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

function cardToPreviewBlock(card: EditorCard, index: number): ItineraryBlock {
  const c = card.content;
  const title =
    (typeof c.title === "string" && c.title) ||
    (typeof c.heading === "string" && c.heading) ||
    cardTypeLabel(card.type);
  const body =
    (typeof c.body === "string" && c.body) ||
    (typeof c.subtitle === "string" && c.subtitle) ||
    (typeof c.description === "string" && c.description) ||
    (typeof c.text === "string" && c.text) ||
    "";

  if (card.type === "hero" || card.type === "image") {
    return {
      id: card.id,
      type: card.type === "hero" ? "hero" : "image",
      title,
      body,
      imageUrl: resolveImage(c.image ?? c.src),
    };
  }

  if (card.type === "schedule" && Array.isArray(c.items)) {
    return {
      id: card.id,
      type: "schedule",
      title,
      scheduleItems: (c.items as { label?: string; time?: string; day?: string }[]).map((item) => ({
        day: item.day ?? "",
        time: item.time ?? "",
        label: item.label ?? "",
      })),
    };
  }

  if (card.type === "checklist" && Array.isArray(c.items)) {
    return {
      id: card.id,
      type: "checklist",
      title,
      checklistItems: (c.items as { text?: string }[]).map((i) => i.text ?? "").filter(Boolean),
    };
  }

  if (card.type === "quote") {
    return {
      id: card.id,
      type: "quote",
      title: "引用",
      body: (c.text as string) ?? body,
      quoteAuthor: typeof c.author === "string" ? c.author : undefined,
    };
  }

  if (isBusinessOnlyCard(card.type)) {
    return {
      id: card.id,
      type: "notice",
      title: `${cardTypeLabel(card.type)}（Business）`,
      body: body || "Web / App の Web エディタで表示・編集できます",
    };
  }

  return {
    id: card.id,
    type: "notice",
    title,
    body: body || cardTypeLabel(card.type),
  };
}

export function coverImageFromCards(cards: EditorCard[]): string {
  for (const card of cards) {
    const url = resolveImage(card.content.image ?? card.content.src);
    if (url) return url;
    if (card.type === "gallery" && Array.isArray(card.content.images)) {
      const first = (card.content.images as { src?: string }[])[0];
      const g = resolveImage(first?.src);
      if (g) return g;
    }
  }
  return DEFAULT_COVER;
}

export function mapPageToItineraryCard(params: {
  informationId: string;
  pageId: string;
  title: string;
  slug: string;
  status?: "draft" | "published";
  hotelId?: string | null;
  cards: EditorCard[];
}): ItineraryCard {
  const blocks = params.cards.map(cardToPreviewBlock);
  const scheduleCount = blocks.filter((b) => b.type === "schedule").length;

  return {
    id: params.informationId,
    slug: params.slug,
    title: params.title,
    subtitle: blocks.find((b) => b.body)?.body?.slice(0, 80) ?? "",
    coverImage: coverImageFromCards(params.cards),
    category: inferCategory(params.title, params.cards),
    location: "日本",
    duration: params.status === "published" ? "公開中" : "下書き",
    stops: scheduleCount || params.cards.length,
    blocks,
    source: "remote",
    status: params.status,
    hotelId: params.hotelId,
    pageId: params.pageId,
  };
}
