"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type ChecklistItem = { text?: string; checked?: boolean };

type ChecklistCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function ChecklistCard({ card, isSelected = false, locale = "ja" }: ChecklistCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = (c?.title as string) ?? "チェックリスト";
  const items = (Array.isArray(c?.items) ? c.items : []) as ChecklistItem[];
  const labels =
    locale === "ko"
      ? { empty: "항목을 추가하세요", titlePlaceholder: "체크리스트" }
      : locale === "zh"
        ? { empty: "请添加项目", titlePlaceholder: "清单" }
        : locale === "en"
          ? { empty: "Add items", titlePlaceholder: "Checklist" }
          : { empty: "項目を追加してください", titlePlaceholder: "チェックリスト" };

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
      <ul className="mt-3 space-y-2" style={getBodyFontSizeStyle()}>
        {items.length === 0 ? (
          <li className="text-slate-500">{labels.empty}</li>
        ) : (
          items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className={
                  "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded border " +
                  (item.checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-transparent")
                }
                aria-hidden
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="m5 12 4 4 10-10" />
                </svg>
              </span>
              <span className="text-slate-700">{item.text ?? ""}</span>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}
