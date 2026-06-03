"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";

type TaxiCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function TaxiCard({ card, isSelected, locale = "ja" }: TaxiCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const phone = (c?.phone as string) ?? "";
  const companyName = getLocalizedContent(c?.companyName as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? {
          companyPlaceholder: "회사명",
          phonePlaceholder: "전화번호",
          notePlaceholder: "비고",
          titlePlaceholder: "택시",
        }
      : locale === "zh"
        ? {
            companyPlaceholder: "公司名称",
            phonePlaceholder: "电话号码",
            notePlaceholder: "备注",
            titlePlaceholder: "出租车",
          }
        : locale === "en"
          ? {
              companyPlaceholder: "Company",
              phonePlaceholder: "Phone number",
              notePlaceholder: "Note",
              titlePlaceholder: "Taxi",
            }
          : {
              companyPlaceholder: "会社名",
              phonePlaceholder: "電話番号",
              notePlaceholder: "備考",
              titlePlaceholder: "タクシー",
            };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  return (
    <Card padding="md" className="">
      {title ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={editable} onActivate={onActivate} className={CARD_BLOCK_TITLE_CLASS} />
        </p>
      ) : null}
      <div data-inner-surface className={`mt-2 space-y-1 ${editorInnerRadiusClassName} bg-slate-50 px-3 py-2`}>
      <p className="text-slate-600" style={getBodyFontSizeStyle()}>
        <InlineEditable value={companyName} onSave={(v) => updateKey("companyName", v)} editable={editable} onActivate={onActivate} className="text-slate-600" placeholder={labels.companyPlaceholder} />
      </p>
      <p className="" style={getBodyFontSizeStyle()}>
        <InlineEditable value={phone} onSave={(v) => updateCard(card.id, { content: { ...c, phone: v } })} editable={editable} onActivate={onActivate} className="font-normal text-ds-primary" placeholder={labels.phonePlaceholder} />
      </p>
      <p className="text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={note} onSave={(v) => updateKey("note", v)} editable={editable} onActivate={onActivate} multiline className="block w-full min-h-[1lh] text-slate-500" placeholder={labels.notePlaceholder} />
      </p>
      </div>
    </Card>
  );
}
