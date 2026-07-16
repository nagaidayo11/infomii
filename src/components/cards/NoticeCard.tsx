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
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { GUEST_CARD_PAD_CLASS } from "@/lib/editor/card-width-mode";
import { useCardInlineEdit } from "./card-inline-edit";

type NoticeCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function NoticeCard({ card, isSelected, locale = "ja" }: NoticeCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const body = getLocalizedContent(c?.body as LocalizedString | undefined, locale);
  const variant = (c?.variant as string) ?? "info";
  const isWarning = variant === "warning";
  const labels =
    locale === "ko"
      ? { bodyPlaceholder: "본문" }
      : locale === "zh"
        ? { bodyPlaceholder: "正文" }
        : locale === "en"
          ? { bodyPlaceholder: "Body" }
          : { bodyPlaceholder: "本文" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  return (
    <Card padding="none">
      <div
        data-inner-surface
        className={`${editorInnerRadiusClassName} flex flex-col gap-2 ${GUEST_CARD_PAD_CLASS} ${isWarning ? "bg-amber-50" : "bg-sky-50/80"}`}
      >
        {(editable || title) ? (
          <div className={`min-w-0 ${CARD_BLOCK_TITLE_CLASS}`} style={getTitleFontSizeStyle()}>
            <InlineEditable
              value={title}
              onSave={(v) => updateKey("title", v)}
              editable={editable}
              onActivate={onActivate}
              className={CARD_BLOCK_TITLE_CLASS}
            />
          </div>
        ) : null}
        <div className={`min-w-0 ${CARD_BLOCK_BODY_CLASS}`} style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={body}
            onSave={(v) => updateKey("body", v)}
            editable={editable}
            onActivate={onActivate}
            multiline
            className={CARD_BLOCK_BODY_CLASS}
            placeholder={labels.bodyPlaceholder}
          />
        </div>
      </div>
    </Card>
  );
}
