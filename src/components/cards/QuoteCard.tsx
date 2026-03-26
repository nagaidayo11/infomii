"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { LineIcon } from "./LineIcon";

type QuoteCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function QuoteCard({ card, isSelected = false }: QuoteCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const quote = (c?.quote as string) ?? "";
  const author = (c?.author as string) ?? "";

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md">
      <div className="flex items-center gap-2 text-slate-500">
        <LineIcon name="quote" className="h-4 w-4" />
        <span className="text-xs font-medium tracking-wide">引用</span>
      </div>
      <blockquote className="mt-2 border-l-2 border-slate-200 pl-3 text-slate-800" style={getBodyFontSizeStyle()}>
        <InlineEditable
          value={quote}
          onSave={(v) => update({ quote: v })}
          editable={isSelected}
          onActivate={onActivate}
          multiline
          className="block min-h-[2em] leading-relaxed"
          placeholder="引用文を入力"
        />
      </blockquote>
      <p className="mt-3 text-slate-500" style={getTitleFontSizeStyle()}>
        <InlineEditable
          value={author}
          onSave={(v) => update({ author: v })}
          editable={isSelected}
          onActivate={onActivate}
          className="inline-block"
          placeholder="出典・著者"
        />
      </p>
    </Card>
  );
}
