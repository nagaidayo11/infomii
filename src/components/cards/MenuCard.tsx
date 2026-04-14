"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { MenuCardHeroImage, MenuItemThumb } from "@/components/cards/menu-card-visual";

type MenuCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function MenuCard({ card, locale = "ja" }: MenuCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { title: "메뉴", itemName: "메뉴명" }
      : locale === "zh"
        ? { title: "菜单", itemName: "菜单名" }
        : locale === "en"
          ? { title: "Menu", itemName: "Menu item" }
          : { title: "メニュー", itemName: "メニュー名" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || labels.title;
  const heroSrc = typeof c?.heroSrc === "string" ? c.heroSrc : "";
  const heroAlt = c?.heroAlt as LocalizedString | undefined;
  const items = Array.isArray(c?.items) ? (c?.items as Array<Record<string, unknown>>) : [];
  const hasHero = heroSrc.trim().length > 0;

  const body = (
    <>
      <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
        {title}
      </p>
      <div className="mt-3 space-y-2.5">
        {items.slice(0, 12).map((item, index) => {
          const name = getLocalizedContent(item.name as LocalizedString | undefined, locale) || labels.itemName;
          const price = getLocalizedContent(item.price as LocalizedString | undefined, locale);
          const description = getLocalizedContent(item.description as LocalizedString | undefined, locale);
          const imageSrc = typeof item.imageSrc === "string" ? item.imageSrc : "";
          const imageAlt = item.imageAlt as LocalizedString | undefined;
          return (
            <div
              key={index}
              data-inner-surface
              className={`flex gap-3 ${editorInnerRadiusClassName} border border-slate-200/90 bg-white p-2.5 shadow-sm`}
            >
              <MenuItemThumb src={imageSrc} alt={imageAlt} locale={locale} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug text-slate-800" style={getBodyFontSizeStyle()}>
                  {name}
                  {price ? <span className="font-semibold text-slate-900"> — {price}</span> : null}
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
