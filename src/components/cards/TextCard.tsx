"use client";

import type { EditorCard } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";

type TextCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function TextCard({ card, isSelected }: TextCardProps) {
  const content = (card.content?.content as string | undefined) ?? "";
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <p className="text-base font-medium text-slate-800">{content || " "}</p>
    </Card>
  );
}
