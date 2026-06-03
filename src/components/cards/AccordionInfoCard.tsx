"use client";

import { useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle, getTitleFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, PlainInline } from "./card-inline-fields";

export function AccordionInfoCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof c.title === "string" ? c.title : "ご案内";
  const items = (Array.isArray(c.items) ? c.items : []) as Array<{ title?: string; body?: string }>;
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <Card padding="md">
      <CardTitleInline title={title} onSave={(v) => editor.setPlainField("title", v)} placeholder="ご案内" bind={bind} />
      <div className="mt-3 space-y-2">
        {items.map((item, idx) => {
          const open = idx === openIndex;
          return (
            <div key={idx} data-inner-surface className={`${editorInnerRadiusClassName} border border-slate-200 bg-slate-50`}>
              <div className="flex w-full items-center justify-between gap-2 px-3 py-2">
                <span className="min-w-0 flex-1 text-left text-sm font-bold text-slate-800">
                  <PlainInline
                    value={item.title ?? ""}
                    onSave={(v) => editor.setArrayItemField("items", idx, "title", v, false)}
                    bind={bind}
                    className="text-sm font-bold text-slate-800"
                    placeholder={`項目 ${idx + 1}`}
                  />
                </span>
                <button
                  type="button"
                  className="shrink-0 px-2 text-slate-600"
                  onClick={() => setOpenIndex(open ? -1 : idx)}
                  aria-expanded={open}
                >
                  {open ? "−" : "+"}
                </button>
              </div>
              {open ? (
                <p className="px-3 pb-3 text-slate-600" style={getBodyFontSizeStyle()}>
                  <PlainInline
                    value={item.body ?? ""}
                    onSave={(v) => editor.setArrayItemField("items", idx, "body", v, false)}
                    bind={bind}
                    multiline
                    className="block w-full min-h-[1lh] text-slate-600"
                    placeholder="本文"
                  />
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
