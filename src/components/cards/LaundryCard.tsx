"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type LaundryCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function LaundryCard({ card, isSelected, locale = "ja" }: LaundryCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "ランドリー";
  const hours = getLocalizedContent(c?.hours as LocalizedString | undefined, locale);
  const priceNote = getLocalizedContent(c?.priceNote as LocalizedString | undefined, locale);
  const contact = getLocalizedContent(c?.contact as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };
  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <p className="font-medium text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} onActivate={onActivate} className="font-medium text-slate-800" placeholder="ランドリー" />
      </p>
      <p className="mt-1 text-slate-600" style={getBodyFontSizeStyle()}>
        営業時間:{" "}
        <InlineEditable value={hours} onSave={(v) => updateKey("hours", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder="9:00–18:00" />
      </p>
      <p className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={priceNote} onSave={(v) => updateKey("priceNote", v)} editable={isSelected} onActivate={onActivate} className="text-slate-500" placeholder="料金・備考" />
      </p>
      <p className="mt-1 text-slate-600" style={getBodyFontSizeStyle()}>
        連絡先:{" "}
        <InlineEditable value={contact} onSave={(v) => updateKey("contact", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder="内線" />
      </p>
    </Card>
  );
}
