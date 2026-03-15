"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type EmergencyCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function EmergencyCard({ card, isSelected, locale = "ja" }: EmergencyCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "緊急連絡先";
  const fire = (c?.fire as string) ?? "";
  const police = (c?.police as string) ?? "";
  const hospital = getLocalizedContent(c?.hospital as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-sm font-medium text-slate-800">🆘 {title}</p>
      <ul className="mt-2 space-y-1 text-xs text-slate-600">
        {fire && (
          <li>
            <a href="tel:119" className="font-medium text-red-600">火災: {fire}</a>
          </li>
        )}
        {police && (
          <li>
            <a href="tel:110" className="font-medium text-slate-800">警察: {police}</a>
          </li>
        )}
        {hospital && (
          <li>
            <span className="text-slate-600">病院: {hospital}</span>
          </li>
        )}
      </ul>
      {note && <p className="mt-2 text-xs text-slate-500">{note}</p>}
    </Card>
  );
}
