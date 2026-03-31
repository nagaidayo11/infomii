"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type FaqItem = { q?: string; a?: string };

type FaqCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function FaqCard({ card, isSelected, locale = "ja" }: FaqCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { title: "자주 묻는 질문", empty: "설정에서 Q&A를 추가하세요", q: "질문", a: "답변" }
      : locale === "zh"
        ? { title: "常见问题", empty: "请在设置中添加问答", q: "问题", a: "回答" }
        : locale === "en"
          ? { title: "FAQ", empty: "Add Q&A in settings", q: "Question", a: "Answer" }
          : { title: "よくある質問", empty: "Q&Aを右のパネルで追加", q: "質問", a: "回答" };
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || labels.title;
  const rawItems = (c?.items as FaqItem[] | undefined) ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [];

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const updateItem = (index: number, field: "q" | "a", value: string) => {
    const next = [...items];
    if (!next[index]) next[index] = { q: "", a: "" };
    next[index] = { ...next[index], [field]: value };
    updateCard(card.id, { content: { ...c, items: next } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <p className="font-semibold text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable
          value={title}
          onSave={(v) => updateKey("title", v)}
          editable={isSelected}
          onActivate={onActivate}
          className="font-semibold text-slate-800"
        />
      </p>
      <dl className="mt-3 space-y-3" style={getBodyFontSizeStyle()}>
        {items.length === 0 ? (
          <p className="text-slate-500">{labels.empty}</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="pb-3 last:pb-0">
              <dt className="font-medium text-slate-700">
                <InlineEditable
                  value={item.q ?? ""}
                  onSave={(v) => updateItem(i, "q", v)}
                  editable={isSelected}
                  onActivate={onActivate}
                  className="font-medium text-slate-700"
                  placeholder={labels.q}
                />
              </dt>
              <dd className="mt-1 text-slate-600">
                <InlineEditable
                  value={item.a ?? ""}
                  onSave={(v) => updateItem(i, "a", v)}
                  editable={isSelected}
                  onActivate={onActivate}
                  multiline
                  className="block min-h-[1em] text-slate-600"
                  placeholder={labels.a}
                />
              </dd>
            </div>
          ))
        )}
      </dl>
    </Card>
  );
}
