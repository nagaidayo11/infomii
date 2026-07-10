"use client";

import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { imageFramingClassName, imageFramingStyle, readImageFraming } from "@/lib/image-framing";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";

type ImageCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function ImageCard({ card, isSelected, locale = "ja" }: ImageCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const src = (c?.src as string | undefined) ?? "";
  const alt = getLocalizedContent(c?.alt as LocalizedString | undefined, locale);
  const framing = readImageFraming(c);
  const framingStyle = imageFramingStyle(framing);
  const framingClass = imageFramingClassName(framing);
  const labels =
    locale === "ko"
      ? { altPlaceholder: "설명(선택)" }
      : locale === "zh"
        ? { altPlaceholder: "说明（可选）" }
        : locale === "en"
          ? { altPlaceholder: "Description (optional)" }
          : { altPlaceholder: "説明（任意）" };

  const updateKey = (key: string, nextValue: string) => {
    const cur = c?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...c, [key]: next } });
  };
  const updateSrc = (v: string) => updateCard(card.id, { content: { ...c, src: v } });

  return (
    <Card padding="md" className="">
      {src ? (
        <div data-inner-surface className={`relative aspect-video w-full overflow-hidden ${editorInnerRadiusClassName} bg-transparent`}>
          <EditorCoverImage src={src} alt={alt} sizes="420px" className={framingClass} style={framingStyle} />
        </div>
      ) : (
        <div className={`aspect-video w-full ${editorInnerRadiusClassName}`}>
          <ImageUpload onUploaded={updateSrc} className="h-full min-h-[120px]" />
        </div>
      )}
      {(src || isSelected) && (isSelected || alt.trim().length > 0) && (
        <p className="mt-2 text-xs text-slate-500">
          <InlineEditable value={alt} onSave={(v) => updateKey("alt", v)} editable={editable} onActivate={onActivate} className="text-xs text-slate-500" placeholder={labels.altPlaceholder} />
        </p>
      )}
    </Card>
  );
}
