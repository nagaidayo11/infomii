"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type WelcomeCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function WelcomeCard({ card, isSelected, locale = "ja" }: WelcomeCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "ようこそ";
  const message = getLocalizedContent(c?.message as LocalizedString | undefined, locale);
  return (
    <Card
      padding="lg"
      className={isSelected ? "ring-2 ring-slate-900 ring-offset-2 ring-offset-slate-50" : ""}
    >
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      {message && <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>}
    </Card>
  );
}
