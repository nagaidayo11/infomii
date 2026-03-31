"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type CheckoutCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function CheckoutCard({ card, isSelected, locale = "ja" }: CheckoutCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "チェックアウト";
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  const linkUrl = (c?.linkUrl as string) ?? "";
  const linkLabel = getLocalizedContent(c?.linkLabel as LocalizedString | undefined, locale) || "詳細";
  const labels =
    locale === "ko"
      ? { notePlaceholder: "보충", detailPlaceholder: "상세" }
      : locale === "zh"
        ? { notePlaceholder: "补充", detailPlaceholder: "详情" }
        : locale === "en"
          ? { notePlaceholder: "Note", detailPlaceholder: "Details" }
          : { notePlaceholder: "補足", detailPlaceholder: "詳細" };

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
        <InlineEditable value={time} onSave={(v) => updateKey("time", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder="11:00" />
      </p>
      <p className="mt-1 text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={note} onSave={(v) => updateKey("note", v)} editable={isSelected} onActivate={onActivate} multiline className="block min-h-[1em] text-slate-500" placeholder={labels.notePlaceholder} />
      </p>
      {linkUrl && (
        <a
          href={linkUrl}
          className="mt-2 inline-block font-medium text-ds-primary underline"
          style={getBodyFontSizeStyle()}
          onClick={isSelected !== undefined ? (e) => e.preventDefault() : undefined}
          aria-disabled={isSelected !== undefined ? true : undefined}
        >
          <InlineEditable value={linkLabel} onSave={(v) => updateKey("linkLabel", v)} editable={isSelected} onActivate={onActivate} className="font-medium text-ds-primary underline" placeholder={labels.detailPlaceholder} />
        </a>
      )}
    </Card>
  );
}
