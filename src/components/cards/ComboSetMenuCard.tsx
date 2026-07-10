"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { MenuCardHeroImage } from "@/components/cards/menu-card-visual";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, MenuItemInlineRow } from "./card-inline-fields";

export function ComboSetMenuCard({ card, locale = "ja" }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const items = Array.isArray(c?.items) ? (c?.items as Array<Record<string, unknown>>) : [];
  const heroSrc = typeof c?.heroSrc === "string" ? c.heroSrc : "";
  const heroAlt = c?.heroAlt as LocalizedString | undefined;
  const hasHero = heroSrc.trim().length > 0;

  const body = (
    <>
      <CardTitleInline title={title} onSave={(v) => editor.setField("title", v)} placeholder="セットメニュー" bind={bind} />
      <div className="mt-3 space-y-2.5">
        {items.map((item, index) => (
          <MenuItemInlineRow
            key={index}
            locale={locale}
            bind={bind}
            name={getLocalizedContent(item.name as LocalizedString | undefined, locale)}
            price={getLocalizedContent(item.price as LocalizedString | undefined, locale)}
            includes={getLocalizedContent(item.includes as LocalizedString | undefined, locale)}
            imageSrc={typeof item.imageSrc === "string" ? item.imageSrc : ""}
            imageAlt={item.imageAlt as LocalizedString | undefined}
            rowClassName="flex gap-3 rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-sm"
            onSaveName={(v) => editor.setArrayItemField("items", index, "name", v)}
            onSavePrice={(v) => editor.setArrayItemField("items", index, "price", v)}
            onSaveIncludes={(v) => editor.setArrayItemField("items", index, "includes", v)}
          />
        ))}
      </div>
    </>
  );

  if (hasHero) {
    return (
      <Card padding="none" className="overflow-hidden">
        <MenuCardHeroImage heroSrc={heroSrc} heroAlt={heroAlt} locale={locale} />
        <div className="px-3 py-3">{body}</div>
      </Card>
    );
  }

  return <Card padding="md">{body}</Card>;
}
