export type ItineraryCategory =
  | "travel"
  | "daytrip"
  | "hotel"
  | "local"
  | "wellness"
  | "oshi"
  | "live"
  | "event"
  | "gourmet"
  | "group";

export type ItineraryBlockType =
  | "hero"
  | "schedule"
  | "checklist"
  | "steps"
  | "map"
  | "nearby"
  | "notice"
  | "welcome"
  | "image"
  | "quote"
  | "gallery"
  | "pricing"
  | "cta"
  | "badge";

export type ScheduleItem = {
  day: string;
  time: string;
  label: string;
};

export type DraftGalleryItem = {
  url: string;
  caption?: string;
};

export type DraftPricingItem = {
  label: string;
  value: string;
};

export type ItineraryBlock = {
  id: string;
  type: ItineraryBlockType;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  scheduleItems?: ScheduleItem[];
  checklistItems?: string[];
  steps?: { title: string; description: string }[];
  nearby?: { name: string; description: string }[];
  quoteAuthor?: string;
  galleryItems?: DraftGalleryItem[];
  pricingItems?: DraftPricingItem[];
  ctaLabel?: string;
  ctaUrl?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeTextColor?: string;
};

export type ItineraryCard = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  coverImage: string;
  category: ItineraryCategory;
  location: string;
  duration: string;
  stops: number;
  featured?: boolean;
  popular?: boolean;
  premium?: boolean;
  blocks: ItineraryBlock[];
  source?: "sample" | "remote";
  status?: "draft" | "published";
  hotelId?: string | null;
  /** Web Editor 2.0 `pages.id`（cards 正本） */
  pageId?: string;
};

export type DraftNearbyItem = {
  name: string;
  description: string;
};

export type DraftStepItem = {
  title: string;
  description: string;
};

export type DraftBlock = {
  id: string;
  type: ItineraryBlockType;
  title: string;
  body?: string;
  imageUrl?: string;
  scheduleItems?: ScheduleItem[];
  checklistItems?: string[];
  nearby?: DraftNearbyItem[];
  steps?: DraftStepItem[];
  quoteAuthor?: string;
  galleryItems?: DraftGalleryItem[];
  pricingItems?: DraftPricingItem[];
  ctaLabel?: string;
  ctaUrl?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeTextColor?: string;
};

export const BADGE_COLOR_PRESETS: { bg: string; text: string; label: string }[] = [
  { bg: "#dcfce7", text: "#065f46", label: "グリーン" },
  { bg: "#dbeafe", text: "#1e40af", label: "ブルー" },
  { bg: "#fef3c7", text: "#92400e", label: "イエロー" },
  { bg: "#fce7f3", text: "#9d174d", label: "ピンク" },
  { bg: "#f3f4f6", text: "#374151", label: "グレー" },
];
