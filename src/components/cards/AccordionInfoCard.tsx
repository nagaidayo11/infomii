"use client";

import { useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useCardContentEditor } from "./card-content-edit";
import { PlainInline } from "./card-inline-fields";

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function AccordionInfoCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof c.title === "string" ? c.title : "ご案内";
  const accent =
    typeof c.accentColor === "string" && c.accentColor.trim() ? c.accentColor.trim() : "#0f766e";
  const items = (Array.isArray(c.items) ? c.items : []) as Array<{ title?: string; body?: string }>;
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section
      className="pres-block"
      style={{ ["--pres-accent" as string]: accent }}
      onClick={bind.editable ? bind.onActivate : undefined}
    >
      {(bind.editable || title) ? (
        <h3 className="pres-block__title">
          <InlineEditable
            value={title}
            onSave={(v) => editor.setPlainField("title", v)}
            editable={bind.editable}
            onActivate={bind.onActivate}
            className="pres-block__title"
            placeholder="ご案内"
          />
        </h3>
      ) : null}
      <div className="pres-accordion">
        {items.map((item, idx) => {
          const open = idx === openIndex;
          return (
            <div key={idx} className="pres-accordion__item" data-open={open ? "true" : "false"}>
              <button
                type="button"
                className="pres-accordion__trigger"
                aria-expanded={open}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex(open ? -1 : idx);
                }}
              >
                <span className="min-w-0 flex-1">
                  <PlainInline
                    value={item.title ?? ""}
                    onSave={(v) => editor.setArrayItemField("items", idx, "title", v, false)}
                    bind={bind}
                    className="text-inherit font-bold"
                    placeholder={`項目 ${idx + 1}`}
                  />
                </span>
                <ChevronDown className="pres-accordion__chevron h-4 w-4" />
              </button>
              {open ? (
                <div className="pres-accordion__body">
                  <PlainInline
                    value={item.body ?? ""}
                    onSave={(v) => editor.setArrayItemField("items", idx, "body", v, false)}
                    bind={bind}
                    multiline
                    className="block w-full min-h-[1lh]"
                    placeholder="本文"
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
