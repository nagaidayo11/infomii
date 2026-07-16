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
import { GUEST_CARD_PAD_SM_CLASS } from "@/lib/editor/card-width-mode";
import { useCardInlineEdit } from "./card-inline-edit";

type WelcomeCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function WelcomeCard({ card, isSelected, locale = "ja" }: WelcomeCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const message = getLocalizedContent(c?.message as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? { messagePlaceholder: "환영 메시지" }
      : locale === "zh"
        ? { messagePlaceholder: "欢迎信息" }
        : locale === "en"
          ? { messagePlaceholder: "Welcome message" }
          : { messagePlaceholder: "おもてなしメッセージ" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  return (
    <Card padding="md" className="">
      {(editable || title) ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
          />
        </p>
      ) : null}
      <div
        data-inner-surface
        className={`mt-2 ${GUEST_CARD_PAD_SM_CLASS} ${editorInnerRadiusClassName} bg-slate-50/80 ${CARD_BLOCK_BODY_CLASS}`}
        style={getBodyFontSizeStyle()}
      >
        <InlineEditable
          value={message}
          onSave={(v) => updateKey("message", v)}
          editable={editable}
          onActivate={onActivate}
          multiline
          className={`block w-full min-h-[1lh] ${CARD_BLOCK_BODY_CLASS}`}
          placeholder={labels.messagePlaceholder}
        />
      </div>
    </Card>
  );
}
