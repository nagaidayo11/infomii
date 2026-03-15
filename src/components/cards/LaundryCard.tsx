"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type LaundryCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function LaundryCard({ card, isSelected, locale = "ja" }: LaundryCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "ランドリー";
  const hours = getLocalizedContent(c?.hours as LocalizedString | undefined, locale);
  const priceNote = getLocalizedContent(c?.priceNote as LocalizedString | undefined, locale);
  const contact = getLocalizedContent(c?.contact as LocalizedString | undefined, locale);
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-sm font-medium text-slate-800">🧺 {title}</p>
      {hours && <p className="mt-1 text-xs text-slate-600">営業時間: {hours}</p>}
      {priceNote && <p className="mt-0.5 text-xs text-slate-500">{priceNote}</p>}
      {contact && <p className="mt-1 text-xs text-slate-600">連絡先: {contact}</p>}
    </Card>
  );
}
