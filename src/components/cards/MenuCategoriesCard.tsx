"use client";

import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { MenuCardHeroImage, MenuCategoryBannerImage } from "@/components/cards/menu-card-visual";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, MenuItemInlineRow, PlainInline } from "./card-inline-fields";

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
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const categories = (Array.isArray(c?.categories) ? c?.categories : []) as Category[];
  const heroSrc = typeof c?.heroSrc === "string" ? c.heroSrc : "";
  const heroAlt = c?.heroAlt as LocalizedString | undefined;
  const hasHero = heroSrc.trim().length > 0;

  const body = (
    <>
      <CardTitleInline title={title} onSave={(v) => editor.setField("title", v)} placeholder="メニュー" bind={bind} />
      <div className="mt-4 space-y-6">
        {categories.map((cat, ci) => {
          const catTitle = getLocalizedContent(cat.title as LocalizedString | undefined, locale);
          const catImg = typeof cat.imageSrc === "string" ? cat.imageSrc : "";
          const items = Array.isArray(cat.items) ? cat.items : [];
          return (
            <div key={ci} className={ci > 0 ? "border-t border-slate-200/80 pt-6" : ""}>
              <p className="text-sm font-semibold tracking-wide text-slate-900" style={getBodyFontSizeStyle()}>
                <PlainInline
                  value={catTitle}
                  onSave={(v) => editor.setCategoryField(ci, "title", v)}
                  bind={bind}
                  className="text-sm font-semibold tracking-wide text-slate-900"
                  placeholder="カテゴリ名"
                />
              </p>
              <MenuCategoryBannerImage src={catImg} alt={cat.imageAlt} locale={locale} />
              <div className="mt-2 space-y-2">
                {items.map((item, ii) => (
                  <MenuItemInlineRow
                    key={ii}
                    locale={locale}
                    bind={bind}
                    name={getLocalizedContent(item.name as LocalizedString | undefined, locale)}
                    price={getLocalizedContent(item.price as LocalizedString | undefined, locale)}
                    description={getLocalizedContent(item.description as LocalizedString | undefined, locale)}
                    tag={getLocalizedContent(item.tag as LocalizedString | undefined, locale)}
                    imageSrc={typeof item.imageSrc === "string" ? item.imageSrc : ""}
                    imageAlt={item.imageAlt}
                    rowClassName="flex gap-3 rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-sm"
                    onSaveName={(v) => editor.setCategoryItemField(ci, ii, "name", v)}
                    onSavePrice={(v) => editor.setCategoryItemField(ci, ii, "price", v)}
                    onSaveDescription={(v) => editor.setCategoryItemField(ci, ii, "description", v)}
                    onSaveTag={(v) => editor.setCategoryItemField(ci, ii, "tag", v)}
                  />
                ))}
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
