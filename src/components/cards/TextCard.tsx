"use client";

import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type TextCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function TextCard({ card, isSelected, locale = "ja" }: TextCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const raw = card.content?.content;
  const content = getLocalizedContent(raw as LocalizedString | undefined, locale);

  const updateContent = (nextValue: string) => {
    const cur = raw;
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { ...card.content, content: next });
  };

  return (
    <Card padding="md" className="">
      <p className="min-h-[1.5em] text-base font-medium text-slate-800">
        <InlineEditable
          value={content}
          onSave={updateContent}
          editable={isSelected}
          multiline
          className="block min-h-[1.5em] text-base font-medium text-slate-800"
          placeholder="テキストを入力"
        />
      </p>
    </Card>
  );
}
