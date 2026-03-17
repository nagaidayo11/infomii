"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useEditor2Store } from "@/components/editor/store";

type HighlightCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

const ACCENT_CLASS: Record<string, string> = {
  amber: "border-l-amber-500 bg-amber-50/90 text-amber-900",
  blue: "border-l-blue-500 bg-blue-50/90 text-blue-900",
  emerald: "border-l-emerald-500 bg-emerald-50/90 text-emerald-900",
};

export function HighlightCard({ card, isSelected = false }: HighlightCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = (c?.title as string) ?? "重要なお知らせ";
  const body = (c?.body as string) ?? "";
  const accent = (c?.accent as string) ?? "amber";
  const accentClass = ACCENT_CLASS[accent] ?? ACCENT_CLASS.amber;

  const update = (patch: Record<string, unknown>) => {
    updateCard(card.id, { content: { ...c, ...patch } });
  };
  const onActivate = () => selectCard(card.id);

  return (
    <div className={`rounded-2xl border-l-4 px-4 py-4 ${accentClass}`}>
      <h3 className="font-bold leading-snug" style={getTitleFontSizeStyle()}>
        <InlineEditable value={title} onSave={(v) => update({ title: v })} editable={isSelected} onActivate={onActivate} className="inherit" placeholder="タイトル" />
      </h3>
      <p className="mt-2 leading-relaxed opacity-95" style={getBodyFontSizeStyle()}>
        <InlineEditable value={body} onSave={(v) => update({ body: v })} editable={isSelected} onActivate={onActivate} multiline className="block min-h-[1em]" placeholder="内容" />
      </p>
    </div>
  );
}
