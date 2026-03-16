"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type SpaCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function SpaCard({ card, isSelected, locale = "ja" }: SpaCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "スパ・温泉";
  const hours = getLocalizedContent(c?.hours as LocalizedString | undefined, locale);
  const location = getLocalizedContent(c?.location as LocalizedString | undefined, locale);
  const description = getLocalizedContent(c?.description as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  return (
    <Card
      padding="md"
      className=""
    >
      <p className="text-sm font-semibold text-slate-800">♨️ {title}</p>
      {hours && <p className="mt-1 text-xs text-slate-600">時間: {hours}</p>}
      {location && <p className="mt-0.5 text-xs text-slate-600">場所: {location}</p>}
      {description && <p className="mt-2 text-xs text-slate-500">{description}</p>}
      {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
    </Card>
  );
}
