/** BtoC marketplace categories (no listing preview image). */
export const BTOC_MARKETPLACE_CATEGORIES = [
  "travel",
  "oshi",
  "personal",
  "food",
  "lightbiz",
] as const;

export type BtocMarketplaceCategory = (typeof BTOC_MARKETPLACE_CATEGORIES)[number];

export const HOTEL_MARKETPLACE_CATEGORIES = [
  "business",
  "resort",
  "ryokan",
  "airbnb",
  "guide",
  "inbound",
] as const;

export type HotelMarketplaceCategory = (typeof HOTEL_MARKETPLACE_CATEGORIES)[number];

export type MarketplaceCategory = BtocMarketplaceCategory | HotelMarketplaceCategory;

export function isBtocMarketplaceCategory(
  category: string | null | undefined,
): category is BtocMarketplaceCategory {
  return (
    category != null &&
    (BTOC_MARKETPLACE_CATEGORIES as readonly string[]).includes(category)
  );
}

/** LP starter slugs (must match seed `slug` fields). */
export const LP_STARTER_TEMPLATE_SLUGS = {
  travel: "travel-itinerary",
  oshi: "oshi-live-set",
  hotel: "hotel-guest-guide",
} as const;

export function buildTemplatesPath(category: string, starter?: string): string {
  const params = new URLSearchParams({ category });
  if (starter) params.set("starter", starter);
  return `/templates?${params.toString()}`;
}

export function buildLpTemplatesLoginHref(category: string, starter: string): string {
  const next = encodeURIComponent(buildTemplatesPath(category, starter));
  return `/login?ref=lp-saas&next=${next}`;
}

export const TEMPLATE_MARKETPLACE_SECTIONS = [
  {
    id: "hospitality",
    label: "宿泊施設 — ページの型",
    categories: [...HOTEL_MARKETPLACE_CATEGORIES],
  },
  {
    id: "personal-daily",
    label: "個人・日常",
    categories: ["travel", "oshi", "personal"] as const,
  },
  {
    id: "food-shop",
    label: "飲食・お店づくり",
    categories: ["food", "lightbiz"] as const,
  },
] as const;

export type TemplateMarketplaceAudience = "hotel" | "personal" | "all";

export const TEMPLATE_AUDIENCE_SECTION_IDS: Record<
  Exclude<TemplateMarketplaceAudience, "all">,
  readonly string[]
> = {
  hotel: ["hospitality"],
  personal: ["personal-daily", "food-shop"],
};

export const TEMPLATE_AUDIENCE_LABELS: Record<TemplateMarketplaceAudience, string> = {
  hotel: "ホテル向け",
  personal: "個人向け",
  all: "すべて",
};

export const TEMPLATE_CATEGORY_LABELS: Record<string, string> = {
  all: "すべて",
  travel: "旅行しおり",
  oshi: "推し活",
  personal: "おでかけ・リンク",
  food: "キッチンカー・飲食",
  lightbiz: "小規模店舗・教室",
  business: "ゲスト案内・運用",
  resort: "体験・ライブ・メニュー",
  ryokan: "旅館・おもてなし",
  airbnb: "民泊・セルフチェックイン",
  guide: "館内ハブ・周辺回遊",
  inbound: "インバウンド・多言語",
};
