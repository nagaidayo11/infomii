"use client";

import type { EditorCard } from "@/components/editor/types";

type SpaceCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function SpaceCard({ card, isSelected = false }: SpaceCardProps) {
  const rawHeight = Number((card.content as Record<string, unknown>)?.height ?? 24);
  const height = Number.isFinite(rawHeight) ? Math.max(0, Math.min(480, rawHeight)) : 24;

  return (
    <div
      className="w-full rounded-lg border border-dashed border-slate-200/90 bg-transparent"
      style={{ height }}
      aria-label={`スペース ${height}px`}
    >
      {isSelected && (
        <div className="flex h-full items-center justify-center text-xs text-slate-400">
          スペース ({height}px)
        </div>
      )}
    </div>
  );
}
