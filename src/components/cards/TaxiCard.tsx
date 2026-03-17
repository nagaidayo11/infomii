"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type TaxiCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function TaxiCard({ card, isSelected, locale = "ja" }: TaxiCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "タクシー";
  const phone = (c?.phone as string) ?? "";
  const companyName = getLocalizedContent(c?.companyName as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <p className="font-medium text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} onActivate={onActivate} className="font-medium text-slate-800" />
      </p>
      <p className="mt-1 text-slate-600" style={getBodyFontSizeStyle()}>
        <InlineEditable value={companyName} onSave={(v) => updateKey("companyName", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder="会社名" />
      </p>
      <p className="mt-1" style={getBodyFontSizeStyle()}>
        <InlineEditable value={phone} onSave={(v) => updateCard(card.id, { content: { ...c, phone: v } })} editable={isSelected} onActivate={onActivate} className="font-medium text-ds-primary" placeholder="電話番号" />
      </p>
      <p className="mt-2 text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={note} onSave={(v) => updateKey("note", v)} editable={isSelected} onActivate={onActivate} multiline className="block min-h-[1em] text-slate-500" placeholder="備考" />
      </p>
    </Card>
  );
}
