"use client";

import { useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";

export function AccordionInfoCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const c = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof c.title === "string" ? c.title : "ご案内";
  const items = (Array.isArray(c.items) ? c.items : []) as Array<{ title?: string; body?: string }>;
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item, idx) => {
          const open = idx === openIndex;
          return (
            <div key={idx} className={`${editorInnerRadiusClassName} border border-slate-200 bg-slate-50`}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? -1 : idx)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-800"
              >
                <span>{item.title ?? `項目 ${idx + 1}`}</span>
                <span>{open ? "−" : "+"}</span>
              </button>
              {open ? <p className="px-3 pb-3 text-slate-600" style={getBodyFontSizeStyle()}>{item.body ?? ""}</p> : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
