"use client";

import type { EditorCard } from "@/components/editor/types";

type DividerCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

/** 区切り線: 線のみ表示。外枠なし。 */
export function DividerCard({ card }: DividerCardProps) {
  const style = (card.content?.style as string) ?? "line";

  return (
    <div className="py-2">
      {style === "dotted" ? (
        <div className="border-t border-dashed border-slate-300" aria-hidden />
      ) : (
        <div className="border-t border-slate-200" aria-hidden />
      )}
    </div>
  );
}
