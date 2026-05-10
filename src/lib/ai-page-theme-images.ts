import {
  PRESET_HERO_SAMPLE_IMAGE,
  PRESET_HERO_SLIDER_FIFTH_SAMPLE_IMAGE,
  PRESET_HERO_SLIDER_FOURTH_SAMPLE_IMAGE,
  PRESET_HERO_SLIDER_SECOND_SAMPLE_IMAGE,
  PRESET_HERO_SLIDER_THIRD_SAMPLE_IMAGE,
} from "@/components/editor/types";

/** Visual preset bucket for AI-generated pages (maps to `/public/templates/previews/...`). */
export type AiPageImageTheme = "business" | "resort" | "ryokan" | "airbnb" | "guide" | "inbound";

export type AiPageImageDefaults = {
  /** Hero / single image card fallback */
  primary: string;
  /** Rotated for gallery slots */
  gallery: readonly string[];
};

const RESORT_GALLERY = [
  "/templates/previews/resort/69ce1fd3.jpg",
  "/templates/previews/resort/5c3df74d.jpg",
  "/templates/previews/resort/ab668978.jpg",
  "/templates/previews/resort/1e839fe9.jpg",
] as const;

const RYOKAN_GALLERY = [
  "/templates/previews/ryokan/fd3c3f68.jpg",
  "/templates/previews/ryokan/f270da26.jpg",
  "/templates/previews/ryokan/185762e5.jpg",
  "/templates/previews/ryokan/bc8ea4ce.jpg",
] as const;

const AIRBNB_GALLERY = [
  "/templates/previews/airbnb/53e75b6f.jpg",
  "/templates/previews/airbnb/fbaaaf4f.jpg",
  "/templates/previews/airbnb/87410d61.jpg",
  "/templates/previews/airbnb/7bfd237b.jpg",
] as const;

const GUIDE_GALLERY = [
  "/templates/previews/guide/b325ae5a.jpg",
  "/templates/previews/guide/41aeb22d.jpg",
  "/templates/previews/guide/0099a24c.jpg",
  "/templates/previews/guide/2b8d79c0.jpg",
] as const;

const INBOUND_GALLERY = [
  "/templates/previews/inbound/ee6ecdd1.jpg",
  "/templates/previews/inbound/c3b36a18.jpg",
  "/templates/previews/inbound/037a944e.jpg",
  "/templates/previews/inbound/0ecd91c9.jpg",
] as const;

const BUSINESS_GALLERY = [
  PRESET_HERO_SAMPLE_IMAGE,
  PRESET_HERO_SLIDER_SECOND_SAMPLE_IMAGE,
  PRESET_HERO_SLIDER_THIRD_SAMPLE_IMAGE,
  PRESET_HERO_SLIDER_FOURTH_SAMPLE_IMAGE,
  PRESET_HERO_SLIDER_FIFTH_SAMPLE_IMAGE,
] as const;

const THEME_GALLERY: Record<AiPageImageTheme, readonly string[]> = {
  business: BUSINESS_GALLERY,
  resort: RESORT_GALLERY,
  ryokan: RYOKAN_GALLERY,
  airbnb: AIRBNB_GALLERY,
  guide: GUIDE_GALLERY,
  inbound: INBOUND_GALLERY,
};

/**
 * Infer image theme from free text (description, URL context, extracted fields).
 * First matching bucket wins; default is business/hotel-like stock photos.
 */
export function inferAiPageImageTheme(text: string): AiPageImageTheme {
  const s = text.toLowerCase();
  if (
    ["旅館", "温泉", "大浴場", "和室", "ryokan", "onsen"].some((k) => s.includes(k.toLowerCase())) ||
    /\bryokan\b/.test(s)
  ) {
    return "ryokan";
  }
  if (
    ["リゾート", "ビーチ", "プール", "resort", "beach", "villa"].some((k) => s.includes(k.toLowerCase())) ||
    /\bresort\b/.test(s)
  ) {
    return "resort";
  }
  if (["民泊", "airbnb", "貸別荘", "vacation rental"].some((k) => s.includes(k.toLowerCase())) || /\bairbnb\b/.test(s)) {
    return "airbnb";
  }
  if (
    ["インバウンド", "外国人", "外国語", "english", "inbound", "international guest"].some((k) =>
      s.includes(k.toLowerCase())
    )
  ) {
    return "inbound";
  }
  if (
    ["観光", "ローカルガイド", "周辺スポット", "散策", "local guide", "sightseeing", "walking tour"].some((k) =>
      s.includes(k.toLowerCase())
    )
  ) {
    return "guide";
  }
  return "business";
}

export function getAiPageDefaultImages(theme: AiPageImageTheme): AiPageImageDefaults {
  const gallery = THEME_GALLERY[theme];
  return { primary: gallery[0] ?? PRESET_HERO_SAMPLE_IMAGE, gallery };
}

function trimSrc(value: unknown, maxLen: number): string {
  return String(value ?? "").trim().slice(0, maxLen);
}

/** Reject empty, non-local, or suspicious `src` so AI output uses themed presets instead of random URLs. */
export function normalizeGeneratedImageSrc(raw: unknown, fallback: string, maxLen = 300): string {
  const s = trimSrc(raw, maxLen);
  if (!s) return fallback;
  if (/^https?:\/\//i.test(s) || s.startsWith("//")) return fallback;
  if (!s.startsWith("/")) return fallback;
  return s;
}

export function gallerySlotSrc(index: number, defaults: AiPageImageDefaults): string {
  const g = defaults.gallery;
  if (g.length === 0) return defaults.primary;
  return g[index % g.length] ?? defaults.primary;
}
