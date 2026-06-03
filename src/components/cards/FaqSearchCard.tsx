"use client";

import { useMemo } from "react";
import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useCardContentEditor } from "./card-content-edit";
import { CardTitleInline, PlainInline } from "./card-inline-fields";

type FaqSearchCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

type FaqItem = { q?: string; a?: string };

export function FaqSearchCard({ card }: FaqSearchCardProps) {
  const editor = useCardContentEditor(card);
  const content = editor.content;
  const bind = { editable: editor.editable, onActivate: editor.onActivate };
  const title = typeof content.title === "string" ? content.title : "よくあるご質問";
  const items = useMemo(
    () =>
      ((Array.isArray(content.items) ? content.items : []) as FaqItem[])
        .map((it) => ({
          q: typeof it?.q === "string" ? it.q : "",
          a: typeof it?.a === "string" ? it.a : "",
        }))
        .filter((it) => it.q.trim() || it.a.trim() || bind.editable)
        .slice(0, 50),
    [content.items, bind.editable],
  );

  return (
    <Card padding="md">
      <CardTitleInline
        title={title}
        onSave={(v) => editor.setPlainField("title", v)}
        placeholder="よくあるご質問"
        bind={bind}
      />
      <div className="mt-3 space-y-2" style={getBodyFontSizeStyle()}>
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div
              key={`${item.q}-${idx}`}
              data-inner-surface
              className={`border border-slate-200 bg-slate-50 px-3 py-2 ${editorInnerRadiusClassName}`}
            >
              <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
                <PlainInline
                  value={item.q}
                  onSave={(v) => editor.setArrayItemField("items", idx, "q", v, false)}
                  bind={bind}
                  className={CARD_BLOCK_TITLE_CLASS}
                  placeholder="質問"
                />
              </p>
              <p className="mt-1 whitespace-pre-line text-slate-600">
                <PlainInline
                  value={item.a}
                  onSave={(v) => editor.setArrayItemField("items", idx, "a", v, false)}
                  bind={bind}
                  multiline
                  className="block w-full min-h-[1lh] whitespace-pre-line text-slate-600"
                  placeholder="回答"
                />
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">質問がまだありません。</p>
        )}
      </div>
    </Card>
  );
}
