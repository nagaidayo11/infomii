"use client";

import type { EditorCard } from "@/components/editor/types";
import { getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { LineIcon } from "./LineIcon";

type MapCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function MapCard({ card, isSelected, locale = "ja" }: MapCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const address = getLocalizedContent(c?.address as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };

  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <div className="flex items-center justify-center rounded-lg bg-slate-100 py-8">
        <span className="text-slate-700" aria-hidden>
          <LineIcon name="map" className="h-8 w-8" />
        </span>
      </div>
      <p className="mt-2 text-slate-700" style={getBodyFontSizeStyle()}>
        <InlineEditable value={address} onSave={(v) => updateKey("address", v)} editable={isSelected} onActivate={onActivate} className="text-slate-700" placeholder="住所" />
      </p>
    </Card>
  );
}
