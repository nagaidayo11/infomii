"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type MapCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function MapCard({ card, isSelected, locale = "ja" }: MapCardProps) {
  const address = getLocalizedContent(card.content?.address as LocalizedString | undefined, locale);
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <div className="flex items-center justify-center rounded-lg bg-slate-100 py-8">
        <span className="text-3xl" aria-hidden>📍</span>
      </div>
      {address && <p className="mt-2 text-sm text-slate-700">{address}</p>}
    </Card>
  );
}
