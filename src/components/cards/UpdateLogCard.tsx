"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";

export function UpdateLogCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof c.title === "string" ? c.title : "更新履歴";
  const items = (Array.isArray(c.items) ? c.items : []) as Array<{ date?: string; at?: string; actor?: string; kind?: string; text?: string }>;
  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>{title}</p>
      <ul className="mt-3 space-y-2" style={getBodyFontSizeStyle()}>
        {items.map((item, idx) => (
          <li key={idx} className={`${editorInnerRadiusClassName} border border-slate-200 bg-slate-50 px-3 py-2`}>
            <p className="text-[11px] font-semibold text-slate-500">
              {item.at ?? item.date ?? ""}{item.actor ? ` / ${item.actor}` : ""}{item.kind ? ` / ${item.kind}` : ""}
            </p>
            <p className="mt-0.5 text-sm text-slate-700">{item.text ?? ""}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
