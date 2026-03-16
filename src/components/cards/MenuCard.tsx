"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type MenuCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function MenuCard({ card, isSelected, locale = "ja" }: MenuCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "メニュー";
  const items = (c?.items as unknown[]) ?? [];
  return (
    <Card padding="md" className="">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-600">{items.length} 品</p>
    </Card>
  );
}
