"use client";

import { useMemo, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
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
  const placeholder =
    typeof content.placeholder === "string" && content.placeholder.trim()
      ? content.placeholder
      : "キーワードで検索";
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
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const visibleItems =
    normalized.length === 0
      ? items
      : items.filter(
          (it) =>
            it.q.toLowerCase().includes(normalized) ||
            it.a.toLowerCase().includes(normalized)
        );

  return (
    <Card padding="md">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
        {title}
      </p>
      <input
        data-inner-surface
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`mt-3 w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 ${editorInnerRadiusClassName}`}
      />
      <div className="mt-3 space-y-2" style={getBodyFontSizeStyle()}>
        {visibleItems.length > 0 ? (
          visibleItems.map((item, idx) => (
            <div
              key={`${item.q}-${idx}`}
              data-inner-surface
              className={`border border-slate-200 bg-slate-50 px-3 py-2 ${editorInnerRadiusClassName}`}
            >
              <p className="font-medium text-slate-800">{item.q || "質問"}</p>
              <p className="mt-1 whitespace-pre-line text-slate-600">{item.a || "回答"}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            該当する質問がありません。
          </p>
        )}
      </div>
    </Card>
  );
}
