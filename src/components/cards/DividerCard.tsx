"use client";

import type { EditorCard } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";

type DividerCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function DividerCard({ card, isSelected }: DividerCardProps) {
  const style = (card.content?.style as string) ?? "line";

  return (
    <Card padding="none" className="py-2">
      {style === "dotted" ? (
        <div className="border-t border-dashed border-slate-300" aria-hidden />
      ) : (
        <div className="border-t border-slate-200" aria-hidden />
      )}
    </Card>
  );
}
