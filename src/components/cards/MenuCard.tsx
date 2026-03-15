"use client";

import type { EditorCard } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";

type MenuCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function MenuCard({ card, isSelected }: MenuCardProps) {
  const c = card.content as { title?: string; items?: unknown[] } | undefined;
  const title = c?.title ?? "メニュー";
  const items = c?.items ?? [];
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-sm font-medium text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-600">{items.length} 品</p>
    </Card>
  );
}
