"use client";

import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type RestaurantCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function RestaurantCard({ card, isSelected, locale = "ja" }: RestaurantCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "レストラン";
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const location = getLocalizedContent(c?.location as LocalizedString | undefined, locale);
  const menu = getLocalizedContent(c?.menu as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };
  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <p className="text-sm font-medium text-slate-800">
        🍽️{" "}
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} onActivate={onActivate} className="text-sm font-medium text-slate-800" placeholder="レストラン" />
      </p>
      <p className="mt-1 text-xs text-slate-600">
        時間:{" "}
        <InlineEditable value={time} onSave={(v) => updateKey("time", v)} editable={isSelected} onActivate={onActivate} className="text-xs text-slate-600" placeholder="7:00–22:00" />
      </p>
      <p className="mt-0.5 text-xs text-slate-600">
        場所:{" "}
        <InlineEditable value={location} onSave={(v) => updateKey("location", v)} editable={isSelected} onActivate={onActivate} className="text-xs text-slate-600" placeholder="1F" />
      </p>
      <p className="mt-2 text-xs text-slate-500">
        <InlineEditable value={menu} onSave={(v) => updateKey("menu", v)} editable={isSelected} onActivate={onActivate} multiline className="block min-h-[1em] text-xs text-slate-500" placeholder="メニュー" />
      </p>
    </Card>
  );
}
