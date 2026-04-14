"use client";

import Image from "next/image";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";

/** Optional full-width hero under block chrome (aspect wide). */
export function MenuCardHeroImage({
  heroSrc,
  heroAlt,
  locale,
}: {
  heroSrc?: string;
  heroAlt?: LocalizedString;
  locale: string;
}) {
  const src = typeof heroSrc === "string" && heroSrc.trim() ? heroSrc.trim() : "";
  if (!src) return null;
  const alt = getLocalizedContent(heroAlt, locale);
  return (
    <div
      className={`relative aspect-[21/9] w-full min-h-[100px] overflow-hidden bg-slate-100 ${editorInnerRadiusClassName}`}
    >
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 480px) 100vw, 420px"
          unoptimized={src.startsWith("http")}
        />
      </div>
    </div>
  );
}

/** Optional category / banner strip (slightly shorter than hero). */
export function MenuCategoryBannerImage({
  src: raw,
  alt,
  locale,
}: {
  src?: string;
  alt?: LocalizedString;
  locale: string;
}) {
  const src = typeof raw === "string" && raw.trim() ? raw.trim() : "";
  if (!src) return null;
  const altText = getLocalizedContent(alt, locale);
  return (
    <div
      className={`relative mt-2 aspect-[2/1] max-h-36 w-full overflow-hidden bg-slate-100 ${editorInnerRadiusClassName}`}
    >
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={altText}
          fill
          className="object-cover object-center"
          sizes="(max-width: 480px) 100vw, 420px"
          unoptimized={src.startsWith("http")}
        />
      </div>
    </div>
  );
}

/** Square thumb for a menu line item. */
export function MenuItemThumb({
  src: raw,
  alt,
  locale,
}: {
  src?: string;
  alt?: LocalizedString;
  locale: string;
}) {
  const src = typeof raw === "string" && raw.trim() ? raw.trim() : "";
  if (!src) return null;
  const altText = getLocalizedContent(alt, locale);
  return (
    <div
      className={`relative h-[76px] w-[76px] shrink-0 overflow-hidden bg-slate-100 ${editorInnerRadiusClassName}`}
    >
      <div className="absolute inset-0">
        <Image
          src={src}
          alt={altText}
          fill
          className="object-cover object-center"
          sizes="76px"
          unoptimized={src.startsWith("http")}
        />
      </div>
    </div>
  );
}
