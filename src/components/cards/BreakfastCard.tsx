"use client";

import type { EditorCard } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";

type BreakfastCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function BreakfastCard({ card, isSelected }: BreakfastCardProps) {
  const c = card.content as { title?: string; time?: string; location?: string } | undefined;
  const title = c?.title ?? "朝食";
  const time = c?.time;
  const location = c?.location;
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {(time || location) && (
        <p className="mt-1 text-xs text-slate-600">
          {[time, location].filter(Boolean).join(" · ")}
        </p>
      )}
    </Card>
  );
}
