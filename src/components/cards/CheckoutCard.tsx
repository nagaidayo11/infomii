"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type CheckoutCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function CheckoutCard({ card, isSelected, locale = "ja" }: CheckoutCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "チェックアウト";
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  const linkUrl = (c?.linkUrl as string) ?? "";
  const linkLabel = getLocalizedContent(c?.linkLabel as LocalizedString | undefined, locale) || "詳細";
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-sm font-medium text-slate-800">🕐 {title}</p>
      {time && <p className="mt-1 text-xs text-slate-600">{time}</p>}
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
      {linkUrl && (
        <a href={linkUrl} className="mt-2 inline-block text-xs font-medium text-ds-primary underline">
          {linkLabel}
        </a>
      )}
    </Card>
  );
}
