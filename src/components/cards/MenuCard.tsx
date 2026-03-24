"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type MenuCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function MenuCard({ card, isSelected, locale = "ja" }: MenuCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "メニュー";
  const items = Array.isArray(c?.items) ? (c?.items as Array<Record<string, unknown>>) : [];
  return (
    <Card padding="md" className="">
      <p className="font-medium text-slate-800" style={getTitleFontSizeStyle()}>{title}</p>
      <div className="mt-2 space-y-1.5">
        {items.slice(0, 5).map((item, index) => {
          const name = getLocalizedContent(item.name as LocalizedString | undefined, locale) || "メニュー名";
          const price = getLocalizedContent(item.price as LocalizedString | undefined, locale);
          const description = getLocalizedContent(item.description as LocalizedString | undefined, locale);
          return (
            <div key={index} className="rounded-lg bg-slate-50 px-2.5 py-2">
              <p className="font-medium text-slate-700" style={getBodyFontSizeStyle()}>
                {name}{price ? ` - ${price}` : ""}
              </p>
              {description ? <p className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>{description}</p> : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
