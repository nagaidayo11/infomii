"use client";

import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type WelcomeCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function WelcomeCard({ card, isSelected, locale = "ja" }: WelcomeCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale) || "ようこそ";
  const message = getLocalizedContent(c?.message as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card
      padding="lg"
      className=""
    >
      <p className="text-lg font-semibold text-slate-900">
        <InlineEditable
          value={title}
          onSave={(v) => updateKey("title", v)}
          editable={isSelected}
          onActivate={onActivate}
          className="text-lg font-semibold text-slate-900"
        />
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        <InlineEditable
          value={message}
          onSave={(v) => updateKey("message", v)}
          editable={isSelected}
          onActivate={onActivate}
          multiline
          className="block min-h-[1.5em] text-sm leading-relaxed text-slate-600"
          placeholder="おもてなしメッセージ"
        />
      </p>
    </Card>
  );
}
