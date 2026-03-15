"use client";

import type { EditorCard } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";

type CheckoutCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function CheckoutCard({ card, isSelected }: CheckoutCardProps) {
  const c = card.content as { title?: string; time?: string } | undefined;
  const title = c?.title ?? "チェックアウト";
  const time = c?.time;
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {time && <p className="mt-1 text-xs text-slate-600">{time}</p>}
    </Card>
  );
}
