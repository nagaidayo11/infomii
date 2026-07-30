"use client";

import type { CSSProperties } from "react";
import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { imageFramingClassName, imageFramingStyle, readImageFraming } from "@/lib/image-framing";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { useEditor2Store } from "@/components/editor/store";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { useCardInlineEdit } from "./card-inline-edit";
import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import { readCardWidthMode } from "@/lib/editor/card-width-mode";
import { readHeroLayout } from "@/lib/editor/hero-layout";

type HeroCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function HeroCard({ card, locale = "ja" }: HeroCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const { isNativeUi } = useClientShell();
  const updateCard = useEditor2Store((s) => s.updateCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = getLocalizedContent(c?.title as LocalizedString | undefined, locale);
  const image = (c?.image as string) ?? "";
  const framing = readImageFraming(c);
  const framingStyle = imageFramingStyle(framing);
  const framingClass = imageFramingClassName(framing);
  const subtitle = getLocalizedContent(c?.subtitle as LocalizedString | undefined, locale);
  const overlayAlign = c?.overlayAlign === "center" ? "center" : "bottom";
  const layout = readHeroLayout(c?.layout);
  const accent =
    typeof c?.accentColor === "string" && c.accentColor.trim() ? c.accentColor.trim() : "#0f766e";
  const fullBleed = readCardWidthMode(c) === "full";
  const squareCorners = c?.cornerStyle === "square" || fullBleed;
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

  const mediaAspect =
    layout === "overlay" && overlayAlign === "center"
      ? "aspect-[16/10] min-h-[168px]"
      : "aspect-[2/1] min-h-[140px]";

  const media = (
    <div
      className={
        "relative w-full overflow-hidden " +
        (isNativeUi ? "bg-[var(--app-surface-muted)] " : "bg-slate-800 ") +
        mediaAspect
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
        <ImageUpload
          onUploaded={(url) => update("image", url)}
          className="relative z-0 h-full min-h-[140px] w-full"
        />
      )}
      {layout === "overlay" ? (
        <div
          className={
            "pointer-events-none absolute inset-0 z-10 " +
            (overlayAlign === "center"
              ? isNativeUi
                ? "bg-gradient-to-b from-black/40 via-black/28 to-black/50"
                : "bg-gradient-to-b from-black/35 via-black/25 to-black/45"
              : isNativeUi
                ? "bg-gradient-to-t from-black/65 via-black/25 to-transparent"
                : "bg-gradient-to-t from-black/60 to-transparent")
          }
        />
      ) : null}
    </div>
  );

  const titleField = (className: string, style?: CSSProperties) =>
    editable || title ? (
      <h2 className={className} style={style}>
        <InlineEditable
          value={title}
          onSave={(v) => update("title", v)}
          editable={editable}
          onActivate={onActivate}
          className={className.includes("text-white") ? "text-white" : undefined}
          placeholder={labels.titlePlaceholder}
        />
      </h2>
    ) : null;

  const subtitleField = (className: string, style?: CSSProperties) =>
    editable || subtitle ? (
      <p className={className} style={style}>
        <InlineEditable
          value={subtitle}
          onSave={(v) => update("subtitle", v)}
          editable={editable}
          onActivate={onActivate}
          className={className.includes("text-white") ? "text-white/95" : undefined}
          placeholder={labels.subtitlePlaceholder}
        />
      </p>
    ) : null;

  if (layout === "stack") {
    return (
      <section
        className={
          "pres-hero pres-hero--stack overflow-hidden " +
          (squareCorners ? "rounded-none" : editorInnerRadiusClassName)
        }
      >
        {media}
        <div className="pres-hero__copy-below">
          {titleField("pres-hero__title", getTitleFontSizeStyle())}
          {subtitleField("pres-hero__subtitle", getBodyFontSizeStyle())}
        </div>
      </section>
    );
  }

  if (layout === "split") {
    return (
      <section
        className={
          "pres-hero pres-hero--split overflow-hidden " +
          (squareCorners ? "rounded-none" : editorInnerRadiusClassName)
        }
        style={{ ["--pres-accent" as string]: accent }}
      >
        {media}
        <div className="pres-hero__band">
          {titleField("pres-hero__band-title", getTitleFontSizeStyle())}
          {subtitleField("pres-hero__band-subtitle", getBodyFontSizeStyle())}
        </div>
      </section>
    );
  }

  if (isNativeUi) {
    const radiusClass = squareCorners ? "rounded-none" : "";
    return (
      <div
        className={
          "app-native-hero app-interactive relative w-full overflow-hidden " +
          (fullBleed ? "app-native-hero--bleed " : "") +
          radiusClass
        }
      >
        {media}
        <div
          className={
            "absolute z-20 text-white " +
            (overlayAlign === "center"
              ? "inset-0 flex flex-col items-center justify-center px-5 text-center"
              : "bottom-0 left-0 right-0 p-4")
          }
        >
          {titleField("app-native-hero-title leading-snug")}
          {subtitleField("app-native-hero-subtitle mt-1 opacity-95")}
        </div>
      </div>
    );
  }

  return (
    <div
      data-inner-surface
      className={
        "app-interactive relative w-full overflow-hidden bg-transparent transition-transform duration-200 ease-out " +
        (fullBleed ? "" : "hover:-translate-y-0.5 ") +
        (squareCorners ? "rounded-none" : editorInnerRadiusClassName)
      }
    >
      {media}
      <div
        className={
          "absolute z-20 text-white " +
          (overlayAlign === "center"
            ? "inset-0 flex flex-col items-center justify-center px-5 text-center"
            : "bottom-0 left-0 right-0 p-4")
        }
      >
        {titleField(
          "leading-snug " +
            (overlayAlign === "center"
              ? "text-[15px] font-semibold tracking-wide sm:text-base"
              : "leading-tight"),
          overlayAlign === "center" ? undefined : getTitleFontSizeStyle(),
        )}
        {subtitleField(
          "opacity-95 " +
            (overlayAlign === "center"
              ? "mt-2 text-[13px] font-medium tracking-wide sm:text-sm"
              : "mt-1"),
          overlayAlign === "center" ? undefined : getBodyFontSizeStyle(),
        )}
      </div>
    </div>
  );
}
