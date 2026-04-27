"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useEditor2Store } from "@/components/editor/store";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type HighlightCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

const ACCENT_CLASS: Record<string, string> = {
  amber: "border-l-amber-500 text-amber-900",
  blue: "border-l-blue-500 text-blue-900",
  emerald: "border-l-emerald-500 text-emerald-900",
};

export function HighlightCard({ card, isSelected = false, locale = "ja" }: HighlightCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? {
          titlePlaceholder: "제목",
          bodyPlaceholder: "내용",
        }
      : locale === "zh"
        ? {
            titlePlaceholder: "标题",
            bodyPlaceholder: "内容",
          }
        : locale === "en"
          ? {
              titlePlaceholder: "Title",
              bodyPlaceholder: "Content",
            }
          : {
              titlePlaceholder: "タイトル",
              bodyPlaceholder: "内容",
            };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const body = getLocalizedContent(c?.body as LocalizedString | undefined, locale);
  const accent = (c?.accent as string) ?? "amber";
  const accentClass = ACCENT_CLASS[accent] ?? ACCENT_CLASS.amber;

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };
  const onActivate = () => selectCard(card.id);

  return (
    <div
      data-inner-surface
      className={`${editorInnerRadiusClassName} border-l-4 px-4 py-4 ${accentClass}`}
      style={{ backgroundColor: "var(--editor-block-surface, rgba(255,255,255,0.92))" }}
    >
      {title ? (
        <h3 className="leading-snug" style={getTitleFontSizeStyle()}>
          <InlineEditable value={title} onSave={(v) => update({ title: v })} editable={isSelected} onActivate={onActivate} className="inherit" placeholder={labels.titlePlaceholder} />
        </h3>
      ) : null}
      <p className="mt-2 whitespace-pre-line leading-relaxed opacity-95" style={getBodyFontSizeStyle()}>
        <InlineEditable value={body} onSave={(v) => update({ body: v })} editable={isSelected} onActivate={onActivate} multiline className="block w-full min-h-[1lh]" placeholder={labels.bodyPlaceholder} />
      </p>
    </div>
  );
}
