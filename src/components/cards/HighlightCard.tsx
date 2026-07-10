"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type HighlightCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

const ACCENT_TEXT: Record<string, string> = {
  amber: "text-amber-900",
  blue: "text-blue-900",
  emerald: "text-emerald-900",
};

const ACCENT_BAR: Record<string, string> = {
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
};

export function HighlightCard({ card, isSelected = false, locale = "ja" }: HighlightCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
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
  const textClass = ACCENT_TEXT[accent] ?? ACCENT_TEXT.amber;
  const barClass = ACCENT_BAR[accent] ?? ACCENT_BAR.amber;

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  return (
    <div
      data-inner-surface
      className={`relative ${editorInnerRadiusClassName} py-3 ${textClass}`}
      style={{ backgroundColor: "var(--editor-block-surface, rgba(255,255,255,0.92))" }}
    >
      <span className={`absolute inset-y-0 left-0 w-1 rounded-l-[inherit] ${barClass}`} aria-hidden />
      <div className="px-3">
        {(editable || title) ? (
          <h3 className="leading-snug" style={getTitleFontSizeStyle()}>
            <InlineEditable
              value={title}
              onSave={(v) => update({ title: v })}
              editable={editable}
              onActivate={onActivate}
              className="inherit"
              placeholder={labels.titlePlaceholder}
            />
          </h3>
        ) : null}
        <p className="mt-2 whitespace-pre-line leading-relaxed opacity-95" style={getBodyFontSizeStyle()}>
          <InlineEditable
            value={body}
            onSave={(v) => update({ body: v })}
            editable={editable}
            onActivate={onActivate}
            multiline
            className="block w-full min-h-[1lh]"
            placeholder={labels.bodyPlaceholder}
          />
        </p>
      </div>
    </div>
  );
}
