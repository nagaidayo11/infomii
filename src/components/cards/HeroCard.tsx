"use client";

import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { imageFramingClassName, imageFramingStyle, readImageFraming } from "@/lib/image-framing";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";

type HeroCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function HeroCard({ card, isSelected = false, locale = "ja" }: HeroCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const image = (c?.image as string) ?? "";
  const framing = readImageFraming(c);
  const framingStyle = imageFramingStyle(framing);
  const framingClass = imageFramingClassName(framing);
  const subtitle = getLocalizedContent(c?.subtitle as LocalizedString | undefined, locale);
  const labels =
    locale === "ko"
      ? { titlePlaceholder: "제목", subtitlePlaceholder: "부제" }
      : locale === "zh"
        ? { titlePlaceholder: "标题", subtitlePlaceholder: "副标题" }
        : locale === "en"
          ? { titlePlaceholder: "Title", subtitlePlaceholder: "Subtitle" }
          : { titlePlaceholder: "タイトル", subtitlePlaceholder: "サブタイトル" };

  const update = (key: string, value: string) => {
    updateCard(card.id, { content: { ...c, [key]: value } });
  };

  return (
    <div
      data-inner-surface
      className={`app-interactive relative w-full overflow-hidden ${editorInnerRadiusClassName} bg-transparent transition-transform duration-200 ease-out hover:-translate-y-0.5`}
    >
      <div className="relative aspect-[2/1] min-h-[140px] w-full overflow-hidden bg-slate-800">
        {image ? (
          <EditorCoverImage
            src={image}
            alt={title || "ヒーロー"}
            priority
            sizes="420px"
            className={framingClass}
            style={framingStyle}
          />
        ) : (
          <ImageUpload onUploaded={(url) => update("image", url)} className="relative z-0 h-full min-h-[140px] w-full" />
        )}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-white">
        {(editable || title) ? (
          <h2 className="leading-tight" style={getTitleFontSizeStyle()}>
            <InlineEditable value={title} onSave={(v) => update("title", v)} editable={editable} onActivate={onActivate} className="text-white" placeholder={labels.titlePlaceholder} />
          </h2>
        ) : null}
        {subtitle && (
          <p className="mt-1 opacity-95" style={getBodyFontSizeStyle()}>
            <InlineEditable value={subtitle} onSave={(v) => update("subtitle", v)} editable={editable} onActivate={onActivate} className="text-white/95" placeholder={labels.subtitlePlaceholder} />
          </p>
        )}
      </div>
    </div>
  );
}
