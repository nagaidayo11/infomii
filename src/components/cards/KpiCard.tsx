"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type KpiItem = { label?: string; value?: string };

type KpiCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function KpiCard({ card, isSelected = false, locale = "ja" }: KpiCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const items = (Array.isArray(c?.items) ? c.items : []) as KpiItem[];
  const labels =
    locale === "ko"
      ? { empty: "수치 항목을 추가하세요", titlePlaceholder: "KPI" }
      : locale === "zh"
        ? { empty: "请添加数值项", titlePlaceholder: "KPI" }
        : locale === "en"
          ? { empty: "Add metric items", titlePlaceholder: "KPI" }
          : { empty: "数値項目を追加してください", titlePlaceholder: "KPI" };
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
      <div className="mt-3 grid grid-cols-2 gap-2" style={getBodyFontSizeStyle()}>
        {items.length === 0 ? (
          <p className="col-span-full text-slate-500">{labels.empty}</p>
        ) : (
          items.map((item, i) => (
            <div key={i} data-inner-surface className={`${editorInnerRadiusClassName} bg-slate-50 p-3`}>
              <p className="text-xs text-slate-500">{item.label ?? ""}</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{item.value ?? ""}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
