"use client";

import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type WifiCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function WifiCard({ card, isSelected, locale = "ja" }: WifiCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const ssid = getLocalizedContent(c?.ssid as LocalizedString | undefined, locale);
  const password = getLocalizedContent(c?.password as LocalizedString | undefined, locale);
  const description = getLocalizedContent(c?.description as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <p className="text-sm font-medium text-slate-800">
        📶{" "}
        <InlineEditable
          value={title}
          onSave={(v) => updateKey("title", v)}
          editable={isSelected}
          onActivate={onActivate}
          className="text-sm font-medium text-slate-800"
          placeholder="WiFi"
        />
      </p>
      <p className="mt-1 text-xs text-slate-600">
        SSID:{" "}
        <InlineEditable
          value={ssid}
          onSave={(v) => updateKey("ssid", v)}
          editable={isSelected}
          onActivate={onActivate}
          className="text-xs text-slate-600"
          placeholder="SSID"
        />
      </p>
      <p className="mt-0.5 text-xs font-mono text-slate-600">
        パスワード:{" "}
        <InlineEditable
          value={password}
          onSave={(v) => updateKey("password", v)}
          editable={isSelected}
          onActivate={onActivate}
          className="text-xs font-mono text-slate-600"
          placeholder="パスワード"
        />
      </p>
      <p className="mt-2 text-xs text-slate-500">
        <InlineEditable
          value={description}
          onSave={(v) => updateKey("description", v)}
          editable={isSelected}
          onActivate={onActivate}
          multiline
          className="block min-h-[1em] text-xs text-slate-500"
          placeholder="説明（任意）"
        />
      </p>
    </Card>
  );
}
