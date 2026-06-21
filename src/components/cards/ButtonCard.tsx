"use client";

import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useGuestPageHref } from "@/lib/use-guest-page-href";
import { useCardInlineEdit } from "./card-inline-edit";

type ButtonCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function ButtonCard({ card, locale = "ja" }: ButtonCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const resolveGuestHref = useGuestPageHref();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const rawHref = (c?.href as string) ?? "#";
  const href = editable ? rawHref : resolveGuestHref(rawHref);
  const labels =
    locale === "ko" ? { buttonPlaceholder: "버튼" } :
    locale === "zh" ? { buttonPlaceholder: "按钮" } :
    locale === "en" ? { buttonPlaceholder: "Button" } :
    { buttonPlaceholder: "ボタン" };
  const label =
    getLocalizedContent(c?.label as LocalizedString | undefined, locale) || labels.buttonPlaceholder;

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  return (
    <Card padding="md" className="">
      <a
        href={href}
        className={`inline-flex w-full items-center justify-center ${editorInnerRadiusClassName} bg-ds-primary px-4 py-3 font-semibold text-white shadow-[var(--shadow-ds-sm)]`}
        style={getTitleFontSizeStyle()}
        onClick={editable ? (e) => e.preventDefault() : undefined}
        aria-disabled={editable ? true : undefined}
      >
        <InlineEditable value={label} onSave={(v) => updateKey("label", v)} editable={editable} onActivate={onActivate} className="text-white" placeholder={labels.buttonPlaceholder} />
      </a>
    </Card>
  );
}
