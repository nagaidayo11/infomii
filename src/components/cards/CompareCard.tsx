"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type CompareCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function CompareCard({ card, isSelected = false, locale = "ja" }: CompareCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { title: "비교", left: "왼쪽", right: "오른쪽", placeholder: "비교" }
      : locale === "zh"
        ? { title: "比较", left: "左侧", right: "右侧", placeholder: "比较" }
        : locale === "en"
          ? { title: "Compare", left: "Left", right: "Right", placeholder: "Compare" }
          : { title: "比較", left: "左", right: "右", placeholder: "比較" };
  const title = (c?.title as string) ?? labels.title;
  const leftTitle = (c?.leftTitle as string) ?? labels.left;
  const leftBody = (c?.leftBody as string) ?? "";
  const rightTitle = (c?.rightTitle as string) ?? labels.right;
  const rightBody = (c?.rightBody as string) ?? "";

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable
          value={title}
          onSave={(v) => update({ title: v })}
          editable={isSelected}
          onActivate={onActivate}
          className="font-semibold text-slate-800"
          placeholder={labels.placeholder}
        />
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2" style={getBodyFontSizeStyle()}>
        <div data-inner-surface className={`${editorInnerRadiusClassName} border border-slate-200 bg-slate-50 p-3`}>
          <p className="font-medium text-slate-800">{leftTitle}</p>
          <p className="mt-1 text-slate-600">{leftBody}</p>
        </div>
        <div data-inner-surface className={`${editorInnerRadiusClassName} border border-slate-200 bg-slate-50 p-3`}>
          <p className="font-medium text-slate-800">{rightTitle}</p>
          <p className="mt-1 text-slate-600">{rightBody}</p>
        </div>
      </div>
    </Card>
  );
}
