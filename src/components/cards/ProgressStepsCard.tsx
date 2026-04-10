"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";

export function ProgressStepsCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof c.title === "string" ? c.title : "進捗";
  const currentStep = Number(c.currentStep ?? 1);
  const items = (Array.isArray(c.items) ? c.items : []) as Array<{ label?: string; done?: boolean }>;
  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>{title}</p>
      <ol className="mt-3 space-y-2" style={getBodyFontSizeStyle()}>
        {items.map((item, idx) => {
          const active = idx + 1 === currentStep;
          const done = item.done === true || idx + 1 < currentStep;
          return (
            <li data-inner-surface key={idx} className={`${editorInnerRadiusClassName} flex items-center gap-2 border px-3 py-2 ${done ? "border-emerald-200 bg-emerald-50" : active ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"}`}>
              <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${done ? "bg-emerald-600 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-700"}`}>{idx + 1}</span>
              <span className="text-sm text-slate-700">{item.label ?? `ステップ ${idx + 1}`}</span>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
