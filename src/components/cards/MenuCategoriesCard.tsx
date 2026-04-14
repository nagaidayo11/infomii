"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getBodyFontSizeStyle, getTitleFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { MenuCardHeroImage, MenuCategoryBannerImage, MenuItemThumb } from "@/components/cards/menu-card-visual";

type CatItem = {
  name?: string;
  price?: string;
  description?: string;
  tag?: string;
  imageSrc?: string;
  imageAlt?: LocalizedString;
};
type Category = { title?: string; imageSrc?: string; imageAlt?: LocalizedString; items?: CatItem[] };

export function MenuCategoriesCard({ card, locale = "ja" }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "メニュー";
  const categories = (Array.isArray(c?.categories) ? c?.categories : []) as Category[];
  const heroSrc = typeof c?.heroSrc === "string" ? c.heroSrc : "";
  const heroAlt = c?.heroAlt as LocalizedString | undefined;
  const hasHero = heroSrc.trim().length > 0;

  const body = (
    <>
      <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
        {title}
      </p>
      <div className="mt-4 space-y-6">
        {categories.map((cat, ci) => {
          const catTitle = getLocalizedContent(cat.title as LocalizedString | undefined, locale);
          const catImg = typeof cat.imageSrc === "string" ? cat.imageSrc : "";
          const items = Array.isArray(cat.items) ? cat.items : [];
          return (
            <div key={ci} className={ci > 0 ? "border-t border-slate-200/80 pt-6" : ""}>
              {catTitle ? (
                <p className="text-sm font-semibold tracking-wide text-slate-900" style={getBodyFontSizeStyle()}>
                  {catTitle}
                </p>
              ) : null}
              <MenuCategoryBannerImage src={catImg} alt={cat.imageAlt} locale={locale} />
              <div className="mt-2 space-y-2">
                {items.map((item, ii) => {
                  const name = getLocalizedContent(item.name as LocalizedString | undefined, locale) || "";
                  const price = getLocalizedContent(item.price as LocalizedString | undefined, locale);
                  const description = getLocalizedContent(item.description as LocalizedString | undefined, locale);
                  const tag = getLocalizedContent(item.tag as LocalizedString | undefined, locale);
                  const imageSrc = typeof item.imageSrc === "string" ? item.imageSrc : "";
                  return (
                    <div
                      key={ii}
                      data-inner-surface
                      className={`flex gap-3 ${editorInnerRadiusClassName} border border-slate-200/90 bg-white p-2.5 shadow-sm`}
                    >
                      <MenuItemThumb src={imageSrc} alt={item.imageAlt} locale={locale} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-snug text-slate-800" style={getBodyFontSizeStyle()}>
                          {name}
                          {price ? <span className="text-slate-900"> — {price}</span> : null}
                          {tag ? (
                            <span className="ml-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                              {tag}
                            </span>
                          ) : null}
                        </p>
                        {description ? (
                          <p className="mt-1 leading-relaxed text-slate-500" style={getBodyFontSizeStyle()}>
                            {description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  if (hasHero) {
    return (
      <Card padding="none" className="overflow-hidden">
        <MenuCardHeroImage heroSrc={heroSrc} heroAlt={heroAlt} locale={locale} />
        <div className="px-4 py-3">{body}</div>
      </Card>
    );
  }

  return <Card padding="md">{body}</Card>;
}
