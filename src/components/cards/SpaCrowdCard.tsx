"use client";

import type { EditorCard } from "@/components/editor/types";
import { LiveOpsCrowdCard } from "./LiveOpsCrowdCard";

export function SpaCrowdCard({
  card,
  isSelected,
  locale = "ja",
}: {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
}) {
  return <LiveOpsCrowdCard card={card} opsKey="spaCrowd" isSelected={isSelected} locale={locale} />;
}
