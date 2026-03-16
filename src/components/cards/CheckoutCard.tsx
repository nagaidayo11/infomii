"use client";

import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type CheckoutCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function CheckoutCard({ card, isSelected, locale = "ja" }: CheckoutCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "チェックアウト";
  const time = getLocalizedContent(c?.time as LocalizedString | undefined, locale);
  const note = getLocalizedContent(c?.note as LocalizedString | undefined, locale);
  const linkUrl = (c?.linkUrl as string) ?? "";
  const linkLabel = getLocalizedContent(c?.linkLabel as LocalizedString | undefined, locale) || "詳細";

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { ...c, [key]: next });
  };

  return (
    <Card padding="md" className="">
      <p className="text-sm font-medium text-slate-800">
        🕐{" "}
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} className="text-sm font-medium text-slate-800" />
      </p>
      <p className="mt-1 text-xs text-slate-600">
        <InlineEditable value={time} onSave={(v) => updateKey("time", v)} editable={isSelected} className="text-xs text-slate-600" placeholder="11:00" />
      </p>
      <p className="mt-1 text-xs text-slate-500">
        <InlineEditable value={note} onSave={(v) => updateKey("note", v)} editable={isSelected} multiline className="block min-h-[1em] text-xs text-slate-500" placeholder="補足" />
      </p>
      {linkUrl && (
        <a href={linkUrl} className="mt-2 inline-block text-xs font-medium text-ds-primary underline">
          <InlineEditable value={linkLabel} onSave={(v) => updateKey("linkLabel", v)} editable={isSelected} className="font-medium text-ds-primary underline" placeholder="詳細" />
        </a>
      )}
    </Card>
  );
}
