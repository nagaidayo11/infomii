"use client";

import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type BreakfastCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function BreakfastCard({ card, isSelected, locale = "ja" }: BreakfastCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const location = getLocalizedContent(c?.location as LocalizedString | undefined, locale);
  const menu = getLocalizedContent(c?.menu as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { ...c, [key]: next });
  };

  return (
    <Card padding="md" className="">
      <p className="text-sm font-medium text-slate-800">🍳 朝食</p>
      <p className="mt-1 text-xs text-slate-600">
        時間:{" "}
        <InlineEditable value={time} onSave={(v) => updateKey("time", v)} editable={isSelected} className="text-xs text-slate-600" placeholder="7:00–9:30" />
      </p>
      <p className="mt-0.5 text-xs text-slate-600">
        会場:{" "}
        <InlineEditable value={location} onSave={(v) => updateKey("location", v)} editable={isSelected} className="text-xs text-slate-600" placeholder="1F ダイニング" />
      </p>
      <p className="mt-2 text-xs text-slate-500">
        <InlineEditable value={menu} onSave={(v) => updateKey("menu", v)} editable={isSelected} multiline className="block min-h-[1em] text-xs text-slate-500" placeholder="メニュー" />
      </p>
    </Card>
  );
}
