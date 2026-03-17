"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type ScheduleCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function ScheduleCard({ card, isSelected, locale = "ja" }: ScheduleCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "営業時間";
  const items = (c?.items as unknown[]) ?? [];
  return (
    <Card padding="md" className="">
      <p className="font-medium text-slate-800" style={getTitleFontSizeStyle()}>{title}</p>
      <p className="mt-1 text-slate-600" style={getBodyFontSizeStyle()}>{items.length} 件</p>
    </Card>
  );
}
