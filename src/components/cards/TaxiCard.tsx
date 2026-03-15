"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type TaxiCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function TaxiCard({ card, isSelected, locale = "ja" }: TaxiCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "タクシー";
  const phone = (c?.phone as string) ?? "";
  const companyName = getLocalizedContent(c?.companyName as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-sm font-medium text-slate-800">🚕 {title}</p>
      {companyName && <p className="mt-1 text-xs text-slate-600">{companyName}</p>}
      {phone && (
        <a href={`tel:${phone.replace(/\D/g, "")}`} className="mt-1 block text-xs font-medium text-ds-primary">
          {phone}
        </a>
      )}
      {note && <p className="mt-2 text-xs text-slate-500">{note}</p>}
    </Card>
  );
}
