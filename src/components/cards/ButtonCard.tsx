"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type ButtonCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function ButtonCard({ card, isSelected, locale = "ja" }: ButtonCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const label = getLocalizedContent(c?.label as LocalizedString | undefined, locale) || "ボタン";
  const href = (c?.href as string) ?? "#";
  const labels =
    locale === "ko" ? { buttonPlaceholder: "버튼" } :
    locale === "zh" ? { buttonPlaceholder: "按钮" } :
    locale === "en" ? { buttonPlaceholder: "Button" } :
    { buttonPlaceholder: "ボタン" };

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const onActivate = () => selectCard(card.id);

  const isEditor = isSelected !== undefined;
  return (
    <Card padding="md" className="">
      <a
        href={href}
        className="inline-flex w-full items-center justify-center rounded-xl bg-ds-primary px-4 py-3 font-medium text-white shadow-[var(--shadow-ds-sm)]"
        style={getTitleFontSizeStyle()}
        onClick={isEditor ? (e) => e.preventDefault() : undefined}
        aria-disabled={isEditor ? true : undefined}
      >
        <InlineEditable value={label} onSave={(v) => updateKey("label", v)} editable={!!isSelected} onActivate={onActivate} className="text-white" placeholder={labels.buttonPlaceholder} />
      </a>
    </Card>
  );
}
