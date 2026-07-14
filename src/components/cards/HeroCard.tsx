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
  const overlayAlign = c?.overlayAlign === "center" ? "center" : "bottom";
  const squareCorners = c?.cornerStyle === "square";
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
      className={
        "app-interactive relative w-full overflow-hidden bg-transparent transition-transform duration-200 ease-out hover:-translate-y-0.5 " +
        (squareCorners ? "rounded-none" : editorInnerRadiusClassName)
      }
    >
      <div
        className={
          "relative w-full overflow-hidden bg-slate-800 " +
          (overlayAlign === "center" ? "aspect-[16/10] min-h-[168px]" : "aspect-[2/1] min-h-[140px]")
        }
      >
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
        <div
          className={
            "pointer-events-none absolute inset-0 z-10 " +
            (overlayAlign === "center"
              ? "bg-gradient-to-b from-black/35 via-black/25 to-black/45"
              : "bg-gradient-to-t from-black/60 to-transparent")
          }
        />
      </div>
      <div
        className={
          "absolute z-20 text-white " +
          (overlayAlign === "center"
            ? "inset-0 flex flex-col items-center justify-center px-5 text-center"
            : "bottom-0 left-0 right-0 p-4")
        }
      >
        {(editable || title) ? (
          <h2
            className={"leading-snug " + (overlayAlign === "center" ? "text-[15px] font-semibold tracking-wide sm:text-base" : "leading-tight")}
            style={overlayAlign === "center" ? undefined : getTitleFontSizeStyle()}
          >
            <InlineEditable value={title} onSave={(v) => update("title", v)} editable={editable} onActivate={onActivate} className="text-white" placeholder={labels.titlePlaceholder} />
          </h2>
        ) : null}
        {(editable || subtitle) ? (
          <p
            className={"opacity-95 " + (overlayAlign === "center" ? "mt-2 text-[13px] font-medium tracking-wide sm:text-sm" : "mt-1")}
            style={overlayAlign === "center" ? undefined : getBodyFontSizeStyle()}
          >
            <InlineEditable value={subtitle} onSave={(v) => update("subtitle", v)} editable={editable} onActivate={onActivate} className="text-white/95" placeholder={labels.subtitlePlaceholder} />
          </p>
        ) : null}
      </div>
    </div>
  );
}
