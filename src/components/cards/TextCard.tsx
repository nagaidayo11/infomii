"use client";

import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type TextCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function TextCard({ card, isSelected, locale = "ja" }: TextCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
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

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="none" className="">
      <div
        data-inner-surface
        className={`px-3 py-2.5 font-medium leading-snug text-slate-800 ${editorInnerRadiusClassName} bg-slate-50/80`}
        style={getBodyFontSizeStyle()}
      >
        <InlineEditable
          value={content}
          onSave={updateContent}
          editable={isSelected}
          onActivate={onActivate}
          multiline
          className="font-medium text-slate-800"
          placeholder={labels.placeholder}
        />
      </div>
    </Card>
  );
}
