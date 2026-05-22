/** BtoC marketplace categories (no listing preview image). */
export const BTOC_MARKETPLACE_CATEGORIES = ["travel", "oshi", "personal"] as const;

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
  hotel: "business-city-guide",
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
    id: "personal-daily",
    label: "個人・日常",
    categories: [...BTOC_MARKETPLACE_CATEGORIES],
  },
  {
    id: "hospitality",
    label: "宿泊施設",
    categories: [...HOTEL_MARKETPLACE_CATEGORIES],
  },
] as const;

export const TEMPLATE_CATEGORY_LABELS: Record<string, string> = {
  all: "すべて",
  travel: "旅行しおり",
  oshi: "推し活",
  personal: "おでかけ・リンク",
  business: "ビジネスホテル",
  resort: "リゾートホテル",
  ryokan: "旅館",
  airbnb: "Airbnb",
  guide: "観光ガイド",
  inbound: "インバウンド",
};
