"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getBodyFontSizeStyle, getTitleFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { MenuCardHeroImage, MenuItemThumb } from "@/components/cards/menu-card-visual";

export function ComboSetMenuCard({ card, locale = "ja" }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const items = Array.isArray(c?.items) ? (c?.items as Array<Record<string, unknown>>) : [];
  const heroSrc = typeof c?.heroSrc === "string" ? c.heroSrc : "";
  const heroAlt = c?.heroAlt as LocalizedString | undefined;
  const hasHero = heroSrc.trim().length > 0;

  const body = (
    <>
      {title ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          {title}
        </p>
      ) : null}
      <div className="mt-3 space-y-2.5">
        {items.map((item, index) => {
          const name = getLocalizedContent(item.name as LocalizedString | undefined, locale) || "";
          const includes = getLocalizedContent(item.includes as LocalizedString | undefined, locale);
          const price = getLocalizedContent(item.price as LocalizedString | undefined, locale);
          const imageSrc = typeof item.imageSrc === "string" ? item.imageSrc : "";
          return (
            <div
              key={index}
              data-inner-surface
              className={`flex gap-3 ${editorInnerRadiusClassName} border border-slate-200/90 bg-white p-2.5 shadow-sm`}
            >
              <MenuItemThumb src={imageSrc} alt={item.imageAlt as LocalizedString | undefined} locale={locale} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug text-slate-900" style={getBodyFontSizeStyle()}>
                  {name}
                  {price ? <span className="ml-2 font-semibold text-slate-800">{price}</span> : null}
                </p>
                {includes ? (
                  <p className="mt-1 leading-relaxed text-slate-600" style={getBodyFontSizeStyle()}>
                    {includes}
                  </p>
                ) : null}
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
