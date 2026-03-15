"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type BreakfastCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function BreakfastCard({ card, isSelected, locale = "ja" }: BreakfastCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const location = getLocalizedContent(c?.location as LocalizedString | undefined, locale);
  const menu = getLocalizedContent(c?.menu as LocalizedString | undefined, locale);
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-sm font-medium text-slate-800">🍳 朝食</p>
      {time && <p className="mt-1 text-xs text-slate-600">時間: {time}</p>}
      {location && <p className="mt-0.5 text-xs text-slate-600">会場: {location}</p>}
      {menu && <p className="mt-2 text-xs text-slate-500">{menu}</p>}
    </Card>
  );
}
