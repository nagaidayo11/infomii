import { ensurePageLinksAfterOpening } from "@/lib/template-marketplace";

export type MarketplaceSeedCategory =
  | "travel"
  | "oshi"
  | "personal"
  | "food"
  | "lightbiz"
  | "business"
  | "resort"
  | "ryokan"
  | "airbnb"
  | "guide"
  | "inbound";

export type MarketplaceSeedCardType =
  | "hero"
  | "heading_body"
  | "info"
  | "highlight"
  | "action"
  | "welcome"
  | "wifi"
  | "breakfast"
  | "checkout"
  | "nearby"
  | "notice"
  | "map"
  | "restaurant"
  | "taxi"
  | "emergency"
  | "laundry"
  | "spa"
  | "image"
  | "video"
  | "button"
  | "faq"
  | "schedule"
  | "menu"
  | "gallery"
  | "parking"
  | "pageLinks"
  | "quote"
  | "checklist"
  | "steps"
  | "compare"
  | "kpi"
  | "tabs_info"
  | "faq_search"
  | "accordion_info"
  | "open_status"
  | "social_links"
  | "contact_hub"
  | "progress_steps"
  | "menu_categories"
  | "daily_special"
  | "drink_menu";

export type MarketplaceSeedCard = {
  type: MarketplaceSeedCardType;
  content: Record<string, unknown>;
  order: number;
};

export type MarketplaceSeedTemplate = {
  slug: string;
  name: string;
  description: string;
  preview_image: string;
  category: MarketplaceSeedCategory;
  cards: MarketplaceSeedCard[];
};

export type CardDraft = Omit<MarketplaceSeedCard, "order">;

export function block(type: MarketplaceSeedCardType, content: Record<string, unknown>): CardDraft {
  return { type, content };
}

export function ordered(cards: CardDraft[]): MarketplaceSeedCard[] {
  return ensurePageLinksAfterOpening(cards).map((card, order) => ({ ...card, order }));
}
