"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type RestaurantCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function RestaurantCard({ card, isSelected, locale = "ja" }: RestaurantCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "レストラン";
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const location = getLocalizedContent(c?.location as LocalizedString | undefined, locale);
  const menu = getLocalizedContent(c?.menu as LocalizedString | undefined, locale);
  return (
    <Card padding="md" className="">
      <p className="text-sm font-medium text-slate-800">🍽️ {title}</p>
      {time && <p className="mt-1 text-xs text-slate-600">時間: {time}</p>}
      {location && <p className="mt-0.5 text-xs text-slate-600">場所: {location}</p>}
      {menu && <p className="mt-2 text-xs text-slate-500">{menu}</p>}
    </Card>
  );
}
