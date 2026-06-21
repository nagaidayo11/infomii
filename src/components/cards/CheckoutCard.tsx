"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useGuestPageHref } from "@/lib/use-guest-page-href";
import { useCardInlineEdit } from "./card-inline-edit";

type CheckoutCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function CheckoutCard({ card, locale = "ja" }: CheckoutCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const resolveGuestHref = useGuestPageHref();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  const linkUrl = (c?.linkUrl as string) ?? "";
  const labels =
    locale === "ko"
      ? {
          notePlaceholder: "보충",
          detailPlaceholder: "상세",
          defaultLinkLabel: "상세",
        }
      : locale === "zh"
        ? {
            notePlaceholder: "补充",
            detailPlaceholder: "详情",
            defaultLinkLabel: "详情",
          }
        : locale === "en"
          ? {
              notePlaceholder: "Note",
              detailPlaceholder: "Details",
              defaultLinkLabel: "Details",
            }
          : {
              notePlaceholder: "補足",
              detailPlaceholder: "詳細",
              defaultLinkLabel: "詳細",
            };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const linkLabel =
    getLocalizedContent(c?.linkLabel as LocalizedString | undefined, locale) ||
    labels.defaultLinkLabel;

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  return (
    <Card padding="md" className="">
      {(editable || title) ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={editable} onActivate={onActivate} className={CARD_BLOCK_TITLE_CLASS} />
        </p>
      ) : null}
      <div data-inner-surface className={`mt-2 space-y-1 ${editorInnerRadiusClassName} bg-slate-50 px-3 py-2`}>
      <p className="text-slate-600" style={getBodyFontSizeStyle()}>
        <InlineEditable value={time} onSave={(v) => updateKey("time", v)} editable={editable} onActivate={onActivate} className="text-slate-600" placeholder="11:00" />
      </p>
      <p className="text-slate-500" style={getBodyFontSizeStyle()}>
        <InlineEditable value={note} onSave={(v) => updateKey("note", v)} editable={editable} onActivate={onActivate} multiline className="block w-full min-h-[1lh] text-slate-500" placeholder={labels.notePlaceholder} />
      </p>
      </div>
      {linkUrl && (
        <a
          href={editable ? linkUrl : resolveGuestHref(linkUrl)}
          className="mt-2 inline-block font-normal text-ds-primary underline"
          style={getBodyFontSizeStyle()}
          onClick={editable ? (e) => e.preventDefault() : undefined}
          aria-disabled={editable ? true : undefined}
        >
          <InlineEditable value={linkLabel} onSave={(v) => updateKey("linkLabel", v)} editable={editable} onActivate={onActivate} className="font-normal text-ds-primary underline" placeholder={labels.detailPlaceholder} />
        </a>
      )}
    </Card>
  );
}
