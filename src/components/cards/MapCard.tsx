"use client";

import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type MapCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function MapCard({ card, isSelected, locale = "ja" }: MapCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const address = getLocalizedContent(c?.address as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { ...c, [key]: next });
  };

  return (
    <Card padding="md" className="">
      <div className="flex items-center justify-center rounded-lg bg-slate-100 py-8">
        <span className="text-3xl" aria-hidden>📍</span>
      </div>
      <p className="mt-2 text-sm text-slate-700">
        <InlineEditable value={address} onSave={(v) => updateKey("address", v)} editable={isSelected} className="text-sm text-slate-700" placeholder="住所" />
      </p>
    </Card>
  );
}
