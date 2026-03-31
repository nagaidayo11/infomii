"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type ParkingCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function ParkingCard({ card, isSelected, locale = "ja" }: ParkingCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { title: "주차장", capacity: "수용 대수", fee: "요금", location: "위치", note: "비고", titlePlaceholder: "주차장", capacityPlaceholder: "50대", feePlaceholder: "무료", locationPlaceholder: "부지 내" }
      : locale === "zh"
        ? { title: "停车场", capacity: "车位数", fee: "费用", location: "位置", note: "备注", titlePlaceholder: "停车场", capacityPlaceholder: "50个车位", feePlaceholder: "免费", locationPlaceholder: "院内" }
        : locale === "en"
          ? { title: "Parking", capacity: "Capacity", fee: "Fee", location: "Location", note: "Note", titlePlaceholder: "Parking", capacityPlaceholder: "50 spaces", feePlaceholder: "Free", locationPlaceholder: "On-site" }
          : { title: "駐車場", capacity: "台数", fee: "料金", location: "場所", note: "備考", titlePlaceholder: "駐車場", capacityPlaceholder: "50台", feePlaceholder: "無料", locationPlaceholder: "敷地内" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || labels.title;
  const capacity = getLocalizedContent(c?.capacity as LocalizedString | undefined, locale);
  const fee = getLocalizedContent(c?.fee as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  const address = getLocalizedContent(c?.address as LocalizedString | undefined, locale);

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
      <p className="mt-1 text-slate-600" style={getBodyFontSizeStyle()}>
        {labels.capacity}: <InlineEditable value={capacity} onSave={(v) => updateKey("capacity", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder={labels.capacityPlaceholder} />
      </p>
      <p className="mt-0.5 text-slate-600" style={getBodyFontSizeStyle()}>
        {labels.fee}: <InlineEditable value={fee} onSave={(v) => updateKey("fee", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder={labels.feePlaceholder} />
      </p>
      <p className="mt-0.5 text-slate-600" style={getBodyFontSizeStyle()}>
        {labels.location}: <InlineEditable value={address} onSave={(v) => updateKey("address", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder={labels.locationPlaceholder} />
      </p>
      <p className="mt-1 text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={note} onSave={(v) => updateKey("note", v)} editable={isSelected} onActivate={onActivate} multiline className="block min-h-[1em] text-slate-500" placeholder={labels.note} />
      </p>
    </Card>
  );
}
