"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type NoticeCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function NoticeCard({ card, isSelected, locale = "ja" }: NoticeCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "お知らせ";
  const body = getLocalizedContent(c?.body as LocalizedString | undefined, locale);
  const variant = (c?.variant as string) ?? "info";
  const isWarning = variant === "warning";
  return (
    <Card
      padding="md"
      className={
        (isWarning ? "bg-amber-50 border-amber-200/80 " : "bg-sky-50/80 border-sky-200/80 ") +
        (isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : "")
      }
    >
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {body && <p className="mt-1 text-xs text-slate-600">{body}</p>}
    </Card>
  );
}
