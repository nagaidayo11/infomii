"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { LineIcon, normalizeIconToken } from "./LineIcon";

type InfoCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

type InfoRow = { label?: string; value?: string };

export function InfoCard({ card, isSelected = false }: InfoCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = (c?.title as string) ?? "情報";
  const icon = normalizeIconToken(c?.icon, "info");
  const rows = (c?.rows as InfoRow[]) ?? [];

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };
  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md">
      <div className="flex items-center gap-3 pb-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <LineIcon name={icon} className="h-5 w-5" />
        </span>
        <h3 className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
          <InlineEditable value={title} onSave={(v) => update({ title: v })} editable={isSelected} onActivate={onActivate} className="text-slate-800" placeholder="タイトル" />
        </h3>
      </div>
      <div className="mt-3 space-y-2" style={getBodyFontSizeStyle()}>
        {rows.length === 0 ? (
          <p className="text-slate-500">ラベルと値を追加</p>
        ) : (
          rows.map((row, i) => (
            <div key={i} className="flex justify-between gap-2">
              <span className="text-slate-500">{row.label ?? "—"}</span>
              <span className="font-medium text-slate-800 truncate max-w-[60%]">
                <InlineEditable
                  value={row.value ?? ""}
                  onSave={(v) => {
                    const next = [...rows];
                    next[i] = { ...next[i], value: v };
                    update({ rows: next });
                  }}
                  editable={isSelected}
                  onActivate={onActivate}
                  className="font-medium text-slate-800"
                  placeholder="値"
                />
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
