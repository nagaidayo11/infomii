/**
 * Per-template preview images under public/templates/previews/<category>/<slug>.jpg
 * Slug is deterministic from template name so DB sync and UI resolve the same path.
 */

const HASH_PRIME = 16777619;
const HASH_OFFSET = 2166136261;

export function templatePreviewSlug(name: string): string {
  let h = HASH_OFFSET;
  for (let i = 0; i < name.length; i += 1) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, HASH_PRIME);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function templatePreviewPublicPath(category: string | null, name: string): string {
  const cat = category?.trim();
  if (!cat) return "/preset-hero-sample.png";
  const slug = templatePreviewSlug(name);
  return `/templates/previews/${cat}/${slug}.jpg`;
}

/** BtoC marketplace: stable path from seed `slug` (not name hash). */
export function btocTemplatePreviewPath(category: string, slug: string): string {
  const cat = category.trim();
  const id = slug.trim();
  if (!cat || !id) return "/preset-hero-sample.png";
  return `/templates/previews/${cat}/${id}.jpg`;
}

/** Category hero used only when category is known but per-template path cannot be built. */
export const TEMPLATE_MARKETPLACE_CATEGORY_FALLBACKS: Record<string, string> = {
  travel: "/templates/previews/travel/travel-itinerary.jpg",
  oshi: "/templates/previews/oshi/oshi-live-set.jpg",
  personal: "/templates/previews/personal/personal-date-plan.jpg",
  food: "/preset-menu-hero-dining.jpg",
  lightbiz: "/preset-menu-hero-salon.jpg",
  business: "/template-business-hero-01.jpg",
  resort: "/template-resort-hero-01.jpg",
  ryokan: "/template-ryokan-hero-01.jpg",
  airbnb: "/template-airbnb-hero-01.jpg",
  guide: "/template-guide-hero-01.jpg",
  inbound: "/template-inbound-hero-01.jpg",
};

const LEGACY_SEED_PREVIEW_PATHS = new Set<string>([
  "/preset-hero-sample.png",
  ...Object.values(TEMPLATE_MARKETPLACE_CATEGORY_FALLBACKS),
]);

/** Old seed wrote the same category hero (or preset) for every row; treat as non-authoritative for listing. */
export function isLegacySeedPreviewImagePath(imagePath: string): boolean {
  const t = imagePath.trim();
  return t.length > 0 && LEGACY_SEED_PREVIEW_PATHS.has(t);
}

function resolveComputedOrCategoryFallback(
  category: string | null | undefined,
  name: string,
  categoryFallback: string,
): string {
  const computed = templatePreviewPublicPath(category ?? null, name);
  if (computed !== "/preset-hero-sample.png") {
    return computed;
  }
  return categoryFallback;
}

/**
 * Resolve image URL for template marketplace cards.
 * - Respect `/templates/previews/...` (per-template assets after sync).
 * - Respect other local paths that are not legacy seed placeholders (custom uploads).
 * - Ignore http(s) URLs and legacy seed paths (`template-*-hero-01.jpg`, `/preset-hero-sample.png`); use deterministic path.
 * - Empty → deterministic path, then category fallback.
 */
import { isBtocMarketplaceCategory } from "@/lib/template-marketplace-meta";

/** BtoC: preview_image 未設定時のみプレースホルダー（パスがあれば表示を試みる） */
export function templateListingUsesPlaceholder(
  category: string | null | undefined,
  previewImage: string | undefined,
): boolean {
  if (!isBtocMarketplaceCategory(category)) return false;
  return !previewImage?.trim();
}

export function resolveTemplateMediaSrc(
  src: string | undefined,
  previewImage: string | undefined,
  category: string | null | undefined,
  name: string,
  categoryFallback: string = "/preset-hero-sample.png",
): string {
  const trimmed = src?.trim() ?? "";
  if (trimmed.startsWith("/templates/previews/")) {
    return trimmed;
  }
  const resolved = resolveTemplateCardImageSrc(
    trimmed || previewImage,
    category,
    name,
    categoryFallback,
  );
  return resolved ?? categoryFallback;
}

export function resolveTemplateCardImageSrc(
  previewImage: string | undefined,
  category: string | null | undefined,
  name: string,
  categoryFallback: string,
): string | null {
  if (templateListingUsesPlaceholder(category, previewImage)) {
    return null;
  }
  const raw = previewImage?.trim() ?? "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return resolveComputedOrCategoryFallback(category, name, categoryFallback);
  }

  if (raw.startsWith("/templates/previews/")) {
    return raw;
  }

  if (raw && isLegacySeedPreviewImagePath(raw)) {
    return resolveComputedOrCategoryFallback(category, name, categoryFallback);
  }

  if (raw) {
    return raw;
  }

  return resolveComputedOrCategoryFallback(category, name, categoryFallback);
}
