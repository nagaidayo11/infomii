"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";

type ActionCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function ActionCard({ card, isSelected = false, locale = "ja" }: ActionCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const labels =
    locale === "ko"
      ? { button: "자세히 보기", placeholder: "버튼" }
      : locale === "zh"
        ? { button: "查看详情", placeholder: "按钮" }
        : locale === "en"
          ? { button: "Learn more", placeholder: "Button" }
          : { button: "詳しく見る", placeholder: "ボタン" };
  const label = (c?.label as string) ?? labels.button;
  const href = (c?.href as string) ?? "#";

  const update = (key: string, value: string) => {
    updateCard(card.id, { content: { ...c, [key]: value } });
  };

  return (
    <div className={editorInnerRadiusClassName}>
      <a
        href={href}
        className={`flex w-full items-center justify-center ${editorInnerRadiusClassName} bg-slate-800 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-700`}
        style={{ boxShadow: "0 4px 14px rgba(15,23,42,0.2)" }}
        onClick={(e) => isSelected && e.preventDefault()}
        aria-disabled={isSelected ? true : undefined}
      >
        <span style={getTitleFontSizeStyle()}>
          <InlineEditable value={label} onSave={(v) => update("label", v)} editable={editable} onActivate={onActivate} className="text-white" placeholder={labels.placeholder} />
        </span>
      </a>
    </div>
  );
}
