"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
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
  const hours = getLocalizedContent(c?.hours as LocalizedString | undefined, locale);
  const priceNote = getLocalizedContent(c?.priceNote as LocalizedString | undefined, locale);
  const contact = getLocalizedContent(c?.contact as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? { hours: "운영 시간", contact: "연락처", titlePlaceholder: "세탁", priceNotePlaceholder: "요금 · 비고", contactPlaceholder: "내선" }
      : locale === "zh"
        ? { hours: "营业时间", contact: "联系方式", titlePlaceholder: "洗衣", priceNotePlaceholder: "费用 / 备注", contactPlaceholder: "分机" }
        : locale === "en"
          ? { hours: "Hours", contact: "Contact", titlePlaceholder: "Laundry", priceNotePlaceholder: "Price / Note", contactPlaceholder: "Extension" }
          : { hours: "営業時間", contact: "連絡先", titlePlaceholder: "ランドリー", priceNotePlaceholder: "料金・備考", contactPlaceholder: "内線" };
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
      <p className="font-medium text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} onActivate={onActivate} className="font-medium text-slate-800" placeholder={labels.titlePlaceholder} />
      </p>
      <div data-inner-surface className={`mt-2 space-y-1 ${editorInnerRadiusClassName} bg-slate-50 px-3 py-2`}>
      <p className="text-slate-600" style={getBodyFontSizeStyle()}>
        {labels.hours}:{" "}
        <InlineEditable value={hours} onSave={(v) => updateKey("hours", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder="9:00–18:00" />
      </p>
      <p className="text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={priceNote} onSave={(v) => updateKey("priceNote", v)} editable={isSelected} onActivate={onActivate} className="text-slate-500" placeholder={labels.priceNotePlaceholder} />
      </p>
      <p className="text-slate-600" style={getBodyFontSizeStyle()}>
        {labels.contact}:{" "}
        <InlineEditable value={contact} onSave={(v) => updateKey("contact", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder={labels.contactPlaceholder} />
      </p>
      </div>
    </Card>
  );
}
