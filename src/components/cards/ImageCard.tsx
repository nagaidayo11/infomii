"use client";

import Image from "next/image";
import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type ImageCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function ImageCard({ card, isSelected, locale = "ja" }: ImageCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const src = (c?.src as string | undefined) ?? "";
  const alt = getLocalizedContent(c?.alt as LocalizedString | undefined, locale);

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };
  const updateSrc = (v: string) => updateCard(card.id, { content: { ...c, src: v } });
  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="none" className="">
      {src ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
          <Image src={src} alt={alt} fill className="object-cover" unoptimized={src.startsWith("http")} />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-100 px-3 text-sm text-slate-500">
          <InlineEditable value="" onSave={updateSrc} editable={isSelected} onActivate={onActivate} className="text-slate-500" placeholder="画像URLを入力" />
        </div>
      )}
      {(src || isSelected) && (
        <p className="mt-2 px-1 text-xs text-slate-500">
          <InlineEditable value={alt} onSave={(v) => updateKey("alt", v)} editable={isSelected} onActivate={onActivate} className="text-xs text-slate-500" placeholder="説明（任意）" />
        </p>
      )}
    </Card>
  );
}
