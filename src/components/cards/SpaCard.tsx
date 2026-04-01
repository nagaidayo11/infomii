"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
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
  const hours = getLocalizedContent(c?.hours as LocalizedString | undefined, locale);
  const location = getLocalizedContent(c?.location as LocalizedString | undefined, locale);
  const description = getLocalizedContent(c?.description as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? { time: "시간", location: "장소", titlePlaceholder: "스파 · 온천", descPlaceholder: "설명", notePlaceholder: "비고" }
      : locale === "zh"
        ? { time: "时间", location: "地点", titlePlaceholder: "SPA / 温泉", descPlaceholder: "说明", notePlaceholder: "备注" }
        : locale === "en"
          ? { time: "Time", location: "Location", titlePlaceholder: "Spa / Onsen", descPlaceholder: "Description", notePlaceholder: "Note" }
          : { time: "時間", location: "場所", titlePlaceholder: "スパ・温泉", descPlaceholder: "説明", notePlaceholder: "備考" };
  const title =
    getLocalizedContent(c?.title as LocalizedString | undefined, locale) || labels.titlePlaceholder;

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };
  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} onActivate={onActivate} className="font-semibold text-slate-800" placeholder={labels.titlePlaceholder} />
      </p>
      <div className={`mt-2 space-y-1 ${editorInnerRadiusClassName} bg-slate-50 px-3 py-2`}>
      <p className="text-slate-600" style={getBodyFontSizeStyle()}>
        {labels.time}:{" "}
        <InlineEditable value={hours} onSave={(v) => updateKey("hours", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder={labels.time} />
      </p>
      <p className="text-slate-600" style={getBodyFontSizeStyle()}>
        {labels.location}:{" "}
        <InlineEditable value={location} onSave={(v) => updateKey("location", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder={labels.location} />
      </p>
      <p className="text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={description} onSave={(v) => updateKey("description", v)} editable={isSelected} onActivate={onActivate} multiline className="block min-h-[1em] text-slate-500" placeholder={labels.descPlaceholder} />
      </p>
      <p className="text-slate-400" style={getBodyFontSizeStyle()}>
        <InlineEditable value={note} onSave={(v) => updateKey("note", v)} editable={isSelected} onActivate={onActivate} className="text-slate-400" placeholder={labels.notePlaceholder} />
      </p>
      </div>
    </Card>
  );
}
