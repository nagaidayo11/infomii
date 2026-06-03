"use client";

import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, PlainInline } from "./card-inline-fields";

export function SocialLinksCard({ card }: { card: EditorCard; isSelected?: boolean; locale?: string }) {
  const editor = useCardContentEditor(card);
  const c = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof c.title === "string" ? c.title : "SNS";
  const items = (Array.isArray(c.items) ? c.items : []) as Array<{ label?: string; href?: string; handle?: string }>;

  return (
    <Card padding="md">
      <CardTitleInline
        title={title}
        onSave={(v) => editor.setPlainField("title", v)}
        placeholder="SNS"
        bind={bind}
      />
      <div className="mt-3 grid grid-cols-1 gap-2">
        {items.map((item, idx) => {
          const href = typeof item.href === "string" ? item.href : "";
          const label = item.label || `SNS ${idx + 1}`;
          const handle = item.handle || "";
          const inner = (
            <div
              data-inner-surface
              className={`${editorInnerRadiusClassName} flex flex-col gap-1 border border-slate-200 bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between`}
            >
              <span className="text-sm font-normal text-slate-800" style={getBodyFontSizeStyle()}>
                <PlainInline
                  value={label}
                  onSave={(v) => editor.setArrayItemField("items", idx, "label", v, false)}
                  bind={bind}
                  className="text-sm text-slate-800"
                  placeholder="ラベル"
                />
              </span>
              <span className="text-xs text-slate-500" style={getBodyFontSizeStyle()}>
                <PlainInline
                  value={handle}
                  onSave={(v) => editor.setArrayItemField("items", idx, "handle", v, false)}
                  bind={bind}
                  className="text-xs text-slate-500"
                  placeholder="@account"
                />
              </span>
              {bind.editable ? (
                <PlainInline
                  value={href}
                  onSave={(v) => editor.setArrayItemField("items", idx, "href", v, false)}
                  bind={bind}
                  className="text-xs text-slate-400"
                  placeholder="https://"
                />
              ) : null}
            </div>
          );
          return href && !bind.editable ? (
            <a key={idx} href={href} target="_blank" rel="noreferrer">
              {inner}
            </a>
          ) : (
            <div key={idx}>{inner}</div>
          );
        })}
      </div>
    </Card>
  );
}
