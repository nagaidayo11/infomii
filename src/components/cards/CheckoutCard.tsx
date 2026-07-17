"use client";

import type { EditorCard } from "@/components/editor/types";
import {
  CARD_BLOCK_BODY_CLASS,
  CARD_BLOCK_TITLE_CLASS,
  getTitleFontSizeStyle,
  getBodyFontSizeStyle,
} from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useGuestPageHref } from "@/lib/use-guest-page-href";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardInlineEdit } from "./card-inline-edit";
import { LabelItemStack, LabelItemSurface } from "./label-item-surface";
import { NativeClockIcon } from "./native-guest-icons";
import { NativeHotelSection, NativeKvList, NativeKvRow } from "./native-hotel-ui";

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
  const { isNativeUi } = useClientShell();
  const resolveGuestHref = useGuestPageHref();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  const linkUrl = (c?.linkUrl as string) ?? "";
  const showTime = c?.show_time !== false;
  const showNote = c?.show_note === true || (c?.show_note !== false && Boolean(note.trim()));
  const labels =
    locale === "ko"
      ? { time: "시간", note: "보충", notePlaceholder: "보충", detailPlaceholder: "상세", defaultLinkLabel: "상세", titlePlaceholder: "체크아웃" }
      : locale === "zh"
        ? { time: "时间", note: "补充", notePlaceholder: "补充", detailPlaceholder: "详情", defaultLinkLabel: "详情", titlePlaceholder: "退房" }
        : locale === "en"
          ? { time: "Time", note: "Note", notePlaceholder: "Note", detailPlaceholder: "Details", defaultLinkLabel: "Details", titlePlaceholder: "Checkout" }
          : { time: "時刻", note: "補足", notePlaceholder: "補足", detailPlaceholder: "詳細", defaultLinkLabel: "詳細", titlePlaceholder: "チェックアウト" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const linkLabel =
    getLocalizedContent(c?.linkLabel as LocalizedString | undefined, locale) ||
    labels.defaultLinkLabel;

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const titleNode = (editable || title) ? (
    <InlineEditable
      value={title}
      onSave={(v) => updateKey("title", v)}
      editable={editable}
      onActivate={onActivate}
      className="app-section-header__title"
      placeholder={labels.titlePlaceholder}
    />
  ) : (
    title || labels.titlePlaceholder
  );

  if (isNativeUi) {
    return (
      <NativeHotelSection title={titleNode} icon={<NativeClockIcon />} onActivate={onActivate}>
        <NativeKvList>
          {showTime ? (
            <NativeKvRow label={labels.time}>
              <InlineEditable
                value={time}
                onSave={(v) => updateKey("time", v)}
                editable={editable}
                onActivate={onActivate}
                placeholder="11:00"
              />
            </NativeKvRow>
          ) : null}
          {showNote ? (
            <NativeKvRow label={labels.note}>
              <InlineEditable
                value={note}
                onSave={(v) => updateKey("note", v)}
                editable={editable}
                onActivate={onActivate}
                multiline
                className="block w-full min-h-[1lh]"
                placeholder={labels.notePlaceholder}
              />
            </NativeKvRow>
          ) : null}
        </NativeKvList>
        {(editable || linkUrl) ? (
          <a
            href={editable ? linkUrl || "#" : resolveGuestHref(linkUrl)}
            className="mt-3 inline-block font-semibold text-[var(--app-accent)]"
            style={getBodyFontSizeStyle()}
            onClick={editable ? (e) => e.preventDefault() : undefined}
            aria-disabled={editable ? true : undefined}
          >
            <InlineEditable
              value={linkLabel}
              onSave={(v) => updateKey("linkLabel", v)}
              editable={editable}
              onActivate={onActivate}
              className="font-semibold text-[var(--app-accent)]"
              placeholder={labels.detailPlaceholder}
            />
          </a>
        ) : null}
      </NativeHotelSection>
    );
  }

  return (
    <Card padding="md">
      {(editable || title) ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={labels.titlePlaceholder}
          />
        </p>
      ) : null}

      <LabelItemStack>
        {showTime ? (
          <LabelItemSurface>
            <p className="font-semibold leading-snug text-slate-800" style={getBodyFontSizeStyle()}>
              {labels.time}
            </p>
            <div className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>
              <InlineEditable
                value={time}
                onSave={(v) => updateKey("time", v)}
                editable={editable}
                onActivate={onActivate}
                className="text-slate-500"
                placeholder="11:00"
              />
            </div>
          </LabelItemSurface>
        ) : null}
        {showNote ? (
          <LabelItemSurface>
            <p className="font-semibold leading-snug text-slate-800" style={getBodyFontSizeStyle()}>
              {labels.note}
            </p>
            <div className="mt-0.5 text-slate-500" style={getBodyFontSizeStyle()}>
              <InlineEditable
                value={note}
                onSave={(v) => updateKey("note", v)}
                editable={editable}
                onActivate={onActivate}
                multiline
                className="block w-full min-h-[1lh] text-slate-500"
                placeholder={labels.notePlaceholder}
              />
            </div>
          </LabelItemSurface>
        ) : null}
      </LabelItemStack>

      {(editable || linkUrl) && (
        <a
          href={editable ? linkUrl || "#" : resolveGuestHref(linkUrl)}
          className={`mt-3 inline-block font-medium text-ds-primary underline underline-offset-2 ${CARD_BLOCK_BODY_CLASS}`}
          style={getBodyFontSizeStyle()}
          onClick={editable ? (e) => e.preventDefault() : undefined}
          aria-disabled={editable ? true : undefined}
        >
          <InlineEditable
            value={linkLabel}
            onSave={(v) => updateKey("linkLabel", v)}
            editable={editable}
            onActivate={onActivate}
            className="font-medium text-ds-primary"
            placeholder={labels.detailPlaceholder}
          />
        </a>
      )}
    </Card>
  );
}
