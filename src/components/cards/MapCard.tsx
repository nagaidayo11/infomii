"use client";

import type { EditorCard } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";

type MapCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function MapCard({ card, isSelected }: MapCardProps) {
  const address = (card.content?.address as string | undefined) ?? "";
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <div className="flex items-center justify-center rounded-lg bg-slate-100 py-8">
        <span className="text-3xl" aria-hidden>📍</span>
      </div>
      {address && <p className="mt-2 text-sm text-slate-700">{address}</p>}
    </Card>
  );
}
