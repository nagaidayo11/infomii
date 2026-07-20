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

/** Hotel marketplace: slug-based listing preview (same layout as BtoC). */
export function marketplaceTemplatePreviewPath(category: string, slug: string): string {
  return btocTemplatePreviewPath(category, slug);
}

const PLACEHOLDER_IMAGE_PREFIXES = ["/preset-hero-sample", "/preset-menu-hero", "/preset-menu-banner"];

export function isSeedPlaceholderImagePath(src: string | undefined): boolean {
  const t = src?.trim() ?? "";
  if (!t) return true;
  if (t === "/preset-hero-sample.png") return true;
  return PLACEHOLDER_IMAGE_PREFIXES.some((prefix) => t.startsWith(prefix));
}

export type TemplateMediaContext = {
  preview_image?: string;
  category?: string | null;
  name: string;
  slug?: string | null;
};

export function resolveTemplatePreviewImagePath(
  ctx: TemplateMediaContext,
  categoryFallback: string,
): string {
  const slugPath =
    ctx.slug?.trim() && ctx.category?.trim()
      ? marketplaceTemplatePreviewPath(ctx.category, ctx.slug)
      : "";
  return resolveTemplateMediaSrc(
    slugPath || undefined,
    ctx.preview_image,
    ctx.category ?? null,
    ctx.name,
    categoryFallback,
  );
}

export function normalizeMarketplaceTemplateCardContent(
  type: string,
  content: Record<string, unknown> | undefined,
  ctx: TemplateMediaContext,
  categoryFallback: string,
): Record<string, unknown> {
  const base = { ...(content ?? {}) };
  const resolve = (src?: string) =>
    resolveTemplateMediaSrc(
      src,
      ctx.preview_image,
      ctx.category ?? null,
      ctx.name,
      categoryFallback,
      ctx.slug,
    );
  const listing = resolveTemplatePreviewImagePath(ctx, categoryFallback);

  if (type === "hero") {
    const raw = typeof base.image === "string" ? base.image : "";
    base.image = isSeedPlaceholderImagePath(raw) ? listing : resolve(raw);
  }
  if (type === "image") {
    const raw = typeof base.src === "string" ? base.src : "";
    base.src = isSeedPlaceholderImagePath(raw) ? listing : resolve(raw);
  }
  if (type === "gallery" && Array.isArray(base.items)) {
    base.items = base.items.map((item, i) => {
      const row = item && typeof item === "object" ? { ...(item as Record<string, unknown>) } : {};
      const raw = typeof row.src === "string" ? row.src : "";
      row.src = isSeedPlaceholderImagePath(raw) ? listing : resolve(raw);
      if (typeof row.alt !== "string" || !row.alt.trim()) row.alt = `gallery-${i + 1}`;
      return row;
    });
  }
  if (type === "hero_slider" && Array.isArray(base.slides)) {
    base.slides = base.slides.map((item, i) => {
      const row = item && typeof item === "object" ? { ...(item as Record<string, unknown>) } : {};
      const raw = typeof row.src === "string" ? row.src : "";
      row.src = isSeedPlaceholderImagePath(raw) ? listing : resolve(raw);
      if (typeof row.alt !== "string" || !row.alt.trim()) row.alt = `slide-${i + 1}`;
      return row;
    });
  }
  if (type === "image_tiles" && Array.isArray(base.items)) {
    base.items = base.items.map((item, i) => {
      const row = item && typeof item === "object" ? { ...(item as Record<string, unknown>) } : {};
      const raw = typeof row.src === "string" ? row.src : "";
      row.src = isSeedPlaceholderImagePath(raw) ? listing : resolve(raw);
      if (typeof row.label !== "string" || !row.label.trim()) row.label = `tile-${i + 1}`;
      return row;
    });
  }
  const rawStyle = base._style;
  if (rawStyle && typeof rawStyle === "object" && !Array.isArray(rawStyle)) {
    const style = { ...(rawStyle as Record<string, unknown>) };
    delete style.fontSize;
    delete style.backgroundColor;
    delete style.padding;
    if (Object.keys(style).length === 0) delete base._style;
    else base._style = style;
  }
  return base;
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
  ryokan: "/templates/previews/ryokan/hotel-ryokan-omotenashi.jpg",
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
  slug?: string | null,
): string {
  if (slug?.trim() && category?.trim()) {
    return marketplaceTemplatePreviewPath(category, slug);
  }
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
  slug?: string | null,
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
    slug,
  );
  return resolved ?? categoryFallback;
}

export function resolveTemplateCardImageSrc(
  previewImage: string | undefined,
  category: string | null | undefined,
  name: string,
  categoryFallback: string,
  slug?: string | null,
): string | null {
  if (templateListingUsesPlaceholder(category, previewImage)) {
    return null;
  }
  const raw = previewImage?.trim() ?? "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return resolveComputedOrCategoryFallback(category, name, categoryFallback, slug);
  }

  if (raw.startsWith("/templates/previews/")) {
    if (slug?.trim() && category?.trim()) {
      const slugPath = marketplaceTemplatePreviewPath(category, slug);
      if (raw !== slugPath) return slugPath;
    }
    return raw;
  }

  if (raw && isLegacySeedPreviewImagePath(raw)) {
    return resolveComputedOrCategoryFallback(category, name, categoryFallback, slug);
  }

  if (raw) {
    return raw;
  }

  return resolveComputedOrCategoryFallback(category, name, categoryFallback, slug);
}
