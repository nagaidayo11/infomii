"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type StepsItem = { title?: string; description?: string };

type StepsCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function StepsCard({ card, isSelected = false, locale = "ja" }: StepsCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const items = (Array.isArray(c?.items) ? c.items : []) as StepsItem[];
  const labels =
    locale === "ko"
      ? { empty: "단계를 추가하세요", titlePlaceholder: "단계" }
      : locale === "zh"
        ? { empty: "请添加步骤", titlePlaceholder: "步骤" }
        : locale === "en"
          ? { empty: "Add steps", titlePlaceholder: "Steps" }
          : { empty: "手順を追加してください", titlePlaceholder: "ステップ" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md">
      {title ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => update({ title: v })}
            editable={isSelected}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={labels.titlePlaceholder}
          />
        </p>
      ) : null}
      <ol className="mt-3 space-y-3" style={getBodyFontSizeStyle()}>
        {items.length === 0 ? (
          <li className="text-slate-500">{labels.empty}</li>
        ) : (
          items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {i + 1}
              </span>
              <div data-inner-surface className={`min-w-0 flex-1 ${editorInnerRadiusClassName} bg-slate-50 px-2 py-2`}>
                <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
                  {getLocalizedContent(item.title as LocalizedString | undefined, locale)}
                </p>
                <p className="mt-0.5 font-normal text-slate-600">
                  {getLocalizedContent(item.description as LocalizedString | undefined, locale)}
                </p>
              </div>
            </li>
          ))
        )}
      </ol>
    </Card>
  );
}
