"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { useEditor2Store } from "@/components/editor/store";

type ActionCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function ActionCard({ card, isSelected = false }: ActionCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const label = (c?.label as string) ?? "詳しく見る";
  const href = (c?.href as string) ?? "#";

  const update = (key: string, value: string) => {
    updateCard(card.id, { content: { ...c, [key]: value } });
  };
  const onActivate = () => selectCard(card.id);

  return (
    <div className="rounded-2xl">
      <a
        href={href}
        className="flex w-full items-center justify-center rounded-2xl bg-slate-800 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-700"
        style={{ boxShadow: "0 4px 14px rgba(15,23,42,0.2)" }}
        onClick={(e) => isSelected && e.preventDefault()}
        aria-disabled={isSelected ? true : undefined}
      >
        <span style={getTitleFontSizeStyle()}>
          <InlineEditable value={label} onSave={(v) => update("label", v)} editable={isSelected} onActivate={onActivate} className="text-white" placeholder="ボタン" />
        </span>
      </a>
    </div>
  );
}
