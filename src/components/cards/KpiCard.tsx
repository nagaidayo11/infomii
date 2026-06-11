"use client";

import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type KpiItem = { label?: string; value?: string };

type KpiCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function KpiCard({ card, isSelected = false, locale = "ja" }: KpiCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
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
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  return (
    <Card padding="md">
      {(editable || title) ? (
        <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
          <InlineEditable
            value={title}
            onSave={(v) => update({ title: v })}
            editable={editable}
            onActivate={onActivate}
            className={CARD_BLOCK_TITLE_CLASS}
            placeholder={labels.titlePlaceholder}
          />
        </p>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-2" style={getBodyFontSizeStyle()}>
        {items.length === 0 ? (
          <p className="col-span-full text-slate-500">{labels.empty}</p>
        ) : (
          items.map((item, i) => (
            <div key={i} data-inner-surface className={`${editorInnerRadiusClassName} bg-slate-50 p-3`}>
              <p className="text-xs text-slate-500">
                <InlineEditable
                  value={item.label ?? ""}
                  onSave={(v) => {
                    const next = [...items];
                    next[i] = { ...(next[i] ?? {}), label: v };
                    update({ items: next });
                  }}
                  editable={editable}
                  onActivate={onActivate}
                  className="text-xs text-slate-500"
                  placeholder="ラベル"
                />
              </p>
              <p className="mt-1 text-lg font-normal text-slate-800">
                <InlineEditable
                  value={item.value ?? ""}
                  onSave={(v) => {
                    const next = [...items];
                    next[i] = { ...(next[i] ?? {}), value: v };
                    update({ items: next });
                  }}
                  editable={editable}
                  onActivate={onActivate}
                  className="text-lg font-normal text-slate-800"
                  placeholder="数値"
                />
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
