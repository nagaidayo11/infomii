"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_BODY_CLASS, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { GUEST_CARD_PAD_CLASS } from "@/lib/editor/card-width-mode";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardInlineEdit } from "./card-inline-edit";

type TextCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function TextCard({ card, isSelected, locale = "ja" }: TextCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const raw = card.content?.content;
  const content = getLocalizedContent(raw as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? { placeholder: "텍스트 입력" }
      : locale === "zh"
        ? { placeholder: "输入文本" }
        : locale === "en"
          ? { placeholder: "Enter text" }
          : { placeholder: "テキストを入力" };

  const updateContent = (nextValue: string) => {
    const cur = raw;
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...card.content, content: next } });
  };

  if (isNativeUi) {
    return (
      <div className="app-native-section app-native-guest-card">
        <div className="app-native-text-block" style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={content}
            onSave={updateContent}
            editable={editable}
            onActivate={onActivate}
            multiline
            className="app-native-text-block"
            placeholder={labels.placeholder}
          />
        </div>
      </div>
    );
  }

  return (
    <Card padding="none" className="">
      <div
        data-inner-surface
        className={`${GUEST_CARD_PAD_CLASS} ${CARD_BLOCK_BODY_CLASS} text-slate-800 ${editorInnerRadiusClassName} bg-white`}
        style={getBodyFontSizeStyle()}
      >
        <InlineEditable
          value={content}
          onSave={updateContent}
          editable={editable}
          onActivate={onActivate}
          multiline
          className={`${CARD_BLOCK_BODY_CLASS} text-slate-800`}
          placeholder={labels.placeholder}
        />
      </div>
    </Card>
  );
}
