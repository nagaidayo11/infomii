"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type TextCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function TextCard({ card, isSelected, locale = "ja" }: TextCardProps) {
  const raw = card.content?.content;
  const content = getLocalizedContent(raw as LocalizedString | undefined, locale);
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-base font-medium text-slate-800">{content || " "}</p>
    </Card>
  );
}
