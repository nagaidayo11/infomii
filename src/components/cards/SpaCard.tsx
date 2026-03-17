"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type SpaCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function SpaCard({ card, isSelected, locale = "ja" }: SpaCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "スパ・温泉";
  const hours = getLocalizedContent(c?.hours as LocalizedString | undefined, locale);
  const location = getLocalizedContent(c?.location as LocalizedString | undefined, locale);
  const description = getLocalizedContent(c?.description as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };
  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} onActivate={onActivate} className="font-semibold text-slate-800" placeholder="スパ・温泉" />
      </p>
      <p className="mt-1 text-slate-600" style={getBodyFontSizeStyle()}>
        時間:{" "}
        <InlineEditable value={hours} onSave={(v) => updateKey("hours", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder="時間" />
      </p>
      <p className="mt-0.5 text-slate-600" style={getBodyFontSizeStyle()}>
        場所:{" "}
        <InlineEditable value={location} onSave={(v) => updateKey("location", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder="場所" />
      </p>
      <p className="mt-2 text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={description} onSave={(v) => updateKey("description", v)} editable={isSelected} onActivate={onActivate} multiline className="block min-h-[1em] text-slate-500" placeholder="説明" />
      </p>
      <p className="mt-1 text-slate-400" style={getBodyFontSizeStyle()}>
        <InlineEditable value={note} onSave={(v) => updateKey("note", v)} editable={isSelected} onActivate={onActivate} className="text-slate-400" placeholder="備考" />
      </p>
    </Card>
  );
}
