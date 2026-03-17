"use client";

import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type NoticeCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function NoticeCard({ card, isSelected, locale = "ja" }: NoticeCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "お知らせ";
  const body = getLocalizedContent(c?.body as LocalizedString | undefined, locale);
  const variant = (c?.variant as string) ?? "info";
  const isWarning = variant === "warning";

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card
      padding="md"
      className={
        (isWarning ? "bg-amber-50 border-amber-200/80 " : "bg-sky-50/80 border-sky-200/80 ") +
        ""
      }
    >
      <p className="text-sm font-medium text-slate-800">
        <InlineEditable
          value={title}
          onSave={(v) => updateKey("title", v)}
          editable={isSelected}
          onActivate={onActivate}
          className="text-sm font-medium text-slate-800"
        />
      </p>
      <p className="mt-1 text-xs text-slate-600">
        <InlineEditable
          value={body}
          onSave={(v) => updateKey("body", v)}
          editable={isSelected}
          onActivate={onActivate}
          multiline
          className="block min-h-[1em] text-xs text-slate-600"
          placeholder="本文"
        />
      </p>
    </Card>
  );
}
