"use client";

import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type ButtonCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function ButtonCard({ card, isSelected, locale = "ja" }: ButtonCardProps) {
  const c = card.content as Record<string, unknown> | undefined;
  const label = getLocalizedContent(c?.label as LocalizedString | undefined, locale) || "ボタン";
  const href = (c?.href as string) ?? "#";
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
