"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
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
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  const linkUrl = (c?.linkUrl as string) ?? "";
  const labels =
    locale === "ko"
      ? {
          notePlaceholder: "보충",
          detailPlaceholder: "상세",
          defaultTitle: "체크아웃",
          defaultLinkLabel: "상세",
        }
      : locale === "zh"
        ? {
            notePlaceholder: "补充",
            detailPlaceholder: "详情",
            defaultTitle: "退房",
            defaultLinkLabel: "详情",
          }
        : locale === "en"
          ? {
              notePlaceholder: "Note",
              detailPlaceholder: "Details",
              defaultTitle: "Check-out",
              defaultLinkLabel: "Details",
            }
          : {
              notePlaceholder: "補足",
              detailPlaceholder: "詳細",
              defaultTitle: "チェックアウト",
              defaultLinkLabel: "詳細",
            };
  const title =
    getLocalizedContent(c?.title as LocalizedString | undefined, locale) || labels.defaultTitle;
  const linkLabel =
    getLocalizedContent(c?.linkLabel as LocalizedString | undefined, locale) ||
    labels.defaultLinkLabel;

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
      <div data-inner-surface className={`mt-2 space-y-1 ${editorInnerRadiusClassName} bg-slate-50 px-3 py-2`}>
      <p className="text-slate-600" style={getBodyFontSizeStyle()}>
        <InlineEditable value={time} onSave={(v) => updateKey("time", v)} editable={isSelected} onActivate={onActivate} className="text-slate-600" placeholder="11:00" />
      </p>
      <p className="text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={note} onSave={(v) => updateKey("note", v)} editable={isSelected} onActivate={onActivate} multiline className="block w-full min-h-[1lh] text-slate-500" placeholder={labels.notePlaceholder} />
      </p>
      </div>
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
