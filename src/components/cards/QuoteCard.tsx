"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { AppSectionHeader } from "@/components/app-shell/primitives";
import { useCardInlineEdit } from "./card-inline-edit";
import { NativeQuoteIcon } from "./native-guest-icons";
import { LineIcon } from "./LineIcon";

type QuoteCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function QuoteCard({ card, isSelected = false, locale = "ja" }: QuoteCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const quote = (c?.quote as string) ?? "";
  const author = (c?.author as string) ?? "";
  const labels =
    locale === "ko"
      ? { quote: "인용", quotePlaceholder: "인용문 입력", authorPlaceholder: "출처·저자" }
      : locale === "zh"
        ? { quote: "引用", quotePlaceholder: "输入引文", authorPlaceholder: "出处 / 作者" }
        : locale === "en"
          ? { quote: "Quote", quotePlaceholder: "Enter quote", authorPlaceholder: "Source / Author" }
          : { quote: "引用", quotePlaceholder: "引用文を入力", authorPlaceholder: "出典・著者" };

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  if (isNativeUi) {
    return (
      <div className="app-native-section app-native-guest-card">
        <AppSectionHeader title={labels.quote} icon={<NativeQuoteIcon />} />
        <blockquote className="app-native-quote" style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={quote}
            onSave={(v) => update({ quote: v })}
            editable={editable}
            onActivate={onActivate}
            multiline
            className="block min-h-[2em] leading-relaxed"
            placeholder={labels.quotePlaceholder}
          />
        </blockquote>
        <p className="app-native-quote-author" style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={author}
            onSave={(v) => update({ author: v })}
            editable={editable}
            onActivate={onActivate}
            className="inline-block"
            placeholder={labels.authorPlaceholder}
          />
        </p>
      </div>
    );
  }

  return (
    <Card padding="md">
      <div className="flex items-center gap-2 text-slate-500">
        <LineIcon name="quote" className="h-4 w-4" />
        <span className="text-xs font-normal tracking-wide">{labels.quote}</span>
      </div>
      <blockquote
        data-inner-surface
        className={`mt-2 border border-slate-100 bg-slate-50/80 px-3 py-2 text-slate-800 ${editorInnerRadiusClassName}`}
        style={getBodyFontSizeStyle()}
      >
        <InlineEditable
          value={quote}
          onSave={(v) => update({ quote: v })}
          editable={editable}
          onActivate={onActivate}
          multiline
          className="block min-h-[2em] leading-relaxed"
          placeholder={labels.quotePlaceholder}
        />
      </blockquote>
      <p className="mt-3 text-slate-500" style={getTitleFontSizeStyle()}>
        <InlineEditable
          value={author}
          onSave={(v) => update({ author: v })}
          editable={editable}
          onActivate={onActivate}
          className="inline-block"
          placeholder={labels.authorPlaceholder}
        />
      </p>
    </Card>
  );
}
