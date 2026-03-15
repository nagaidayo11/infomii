"use client";

import type { EditorCard } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";

type ButtonCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function ButtonCard({ card, isSelected }: ButtonCardProps) {
  const c = card.content as { label?: string; href?: string } | undefined;
  const label = c?.label ?? "ボタン";
  const href = c?.href ?? "#";
  return (
    <Card padding="md" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      <a
        href={href}
        className="inline-flex w-full items-center justify-center rounded-xl bg-ds-primary px-4 py-3 text-sm font-medium text-white shadow-[var(--shadow-ds-sm)]"
      >
        {label}
      </a>
    </Card>
  );
}
