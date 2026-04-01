"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

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
  const title = (c?.title as string) ?? labels.titlePlaceholder;

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
          placeholder={labels.titlePlaceholder}
        />
      </p>
      <ol className="mt-3 space-y-3" style={getBodyFontSizeStyle()}>
        {items.length === 0 ? (
          <li className="text-slate-500">{labels.empty}</li>
        ) : (
          items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{item.title ?? ""}</p>
                <p className="mt-0.5 text-slate-600">{item.description ?? ""}</p>
              </div>
            </li>
          ))
        )}
      </ol>
    </Card>
  );
}
