"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";

export function MultilingualNoticeCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof c.title === "string" ? c.title : "多言語注意文";
  const rows = [
    { lang: "JA", text: typeof c.ja === "string" ? c.ja : "" },
    { lang: "EN", text: typeof c.en === "string" ? c.en : "" },
    { lang: "中文", text: typeof c.zh === "string" ? c.zh : "" },
    { lang: "한국어", text: typeof c.ko === "string" ? c.ko : "" },
  ];
  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>{title}</p>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.lang} className={`${editorInnerRadiusClassName} border border-slate-200 bg-slate-50 px-3 py-2`}>
            <p className="text-[11px] font-semibold text-slate-500">{row.lang}</p>
            <p className="mt-0.5 text-sm text-slate-700" style={getBodyFontSizeStyle()}>{row.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
