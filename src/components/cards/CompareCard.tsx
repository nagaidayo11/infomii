"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type CompareCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function CompareCard({ card, isSelected = false }: CompareCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = (c?.title as string) ?? "比較";
  const leftTitle = (c?.leftTitle as string) ?? "左";
  const leftBody = (c?.leftBody as string) ?? "";
  const rightTitle = (c?.rightTitle as string) ?? "右";
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
          placeholder="比較"
        />
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2" style={getBodyFontSizeStyle()}>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="font-medium text-slate-800">{leftTitle}</p>
          <p className="mt-1 text-slate-600">{leftBody}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="font-medium text-slate-800">{rightTitle}</p>
          <p className="mt-1 text-slate-600">{rightBody}</p>
        </div>
      </div>
    </Card>
  );
}
