"use client";

import { useMemo } from "react";
import type { EditorCard } from "@/components/editor/types";
import { CARD_BLOCK_TITLE_CLASS, getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";

type FaqSearchCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

type FaqItem = { q?: string; a?: string };

export function FaqSearchCard({ card }: FaqSearchCardProps) {
  const content = (card.content ?? {}) as Record<string, unknown>;
  const title = typeof content.title === "string" ? content.title : "よくあるご質問";
  const items = useMemo(
    () =>
      ((Array.isArray(content.items) ? content.items : []) as FaqItem[])
        .map((it) => ({
          q: typeof it?.q === "string" ? it.q : "",
          a: typeof it?.a === "string" ? it.a : "",
        }))
        .filter((it) => it.q.trim() || it.a.trim())
        .slice(0, 50),
    [content.items]
  );

  return (
    <Card padding="md">
      <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>
        {title}
      </p>
      <div className="mt-3 space-y-2" style={getBodyFontSizeStyle()}>
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div
              key={`${item.q}-${idx}`}
              data-inner-surface
              className={`border border-slate-200 bg-slate-50 px-3 py-2 ${editorInnerRadiusClassName}`}
            >
              <p className={CARD_BLOCK_TITLE_CLASS} style={getTitleFontSizeStyle()}>{item.q || "質問"}</p>
              <p className="mt-1 whitespace-pre-line text-slate-600">{item.a || "回答"}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">質問がまだありません。</p>
        )}
      </div>
    </Card>
  );
}
