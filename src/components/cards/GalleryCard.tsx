"use client";

import type { EditorCard } from "@/components/editor/types";
import { EditorCoverImage } from "@/components/editor/EditorCoverImage";
import { getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { useEditor2Store } from "@/components/editor/store";
import { useCardInlineEdit } from "./card-inline-edit";

type GalleryItem = { src?: string; alt?: string; caption?: string };

type GalleryCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function GalleryCard({ card, locale = "ja" }: GalleryCardProps) {
  const { editable, onActivate } = useCardInlineEdit(card.id);
  const updateCard = useEditor2Store((s) => s.updateCard);
  const content = card.content as Record<string, unknown>;
  const title = getLocalizedContent(content?.title as LocalizedString | undefined, locale);
  const items = (Array.isArray(content?.items) ? content.items : [{ src: "", alt: "" }]) as GalleryItem[];
  const rawColumns = typeof content?.columns === "number" ? content.columns : Number(content?.columns);
  const columns = rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 2;
  const labels =
    locale === "ko"
      ? { emptyImage: "이미지", titlePlaceholder: "갤러리", captionPlaceholder: "캡션" }
      : locale === "zh"
        ? { emptyImage: "图片", titlePlaceholder: "图库", captionPlaceholder: "说明" }
        : locale === "en"
          ? { emptyImage: "Image", titlePlaceholder: "Gallery", captionPlaceholder: "Caption" }
          : { emptyImage: "画像", titlePlaceholder: "ギャラリー", captionPlaceholder: "キャプション" };

  const updateKey = (key: string, nextValue: string) => {
    const cur = content?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...content, [key]: next } });
  };

  const updateCaption = (index: number, value: string) => {
    const next = items.map((item, i) => (i === index ? { ...item, caption: value } : item));
    updateCard(card.id, { content: { ...content, items: next } });
  };

  return (
    <section className="pres-block" onClick={editable ? onActivate : undefined}>
      {(editable || title) ? (
        <h3 className="pres-block__title">
          <InlineEditable
            value={title}
            onSave={(v) => updateKey("title", v)}
            editable={editable}
            onActivate={onActivate}
            className="pres-block__title"
            placeholder={labels.titlePlaceholder}
          />
        </h3>
      ) : null}
      <div className="pres-gallery" data-cols={String(columns)}>
        {items.slice(0, 12).map((item, i) => {
          const caption = getLocalizedContent(item.caption as LocalizedString | undefined, locale);
          return (
            <div key={i} className="pres-gallery__cell">
              {item?.src ? (
                <EditorCoverImage
                  src={item.src}
                  alt={getLocalizedContent(item.alt as LocalizedString | undefined, locale) || ""}
                  sizes="160px"
                  className="object-cover object-center"
                />
              ) : (
                <div
                  className="flex h-full items-center justify-center text-slate-400"
                  style={getBodyFontSizeStyle()}
                >
                  {labels.emptyImage}
                </div>
              )}
              {editable || caption ? (
                <div className="pres-gallery__caption">
                  <InlineEditable
                    value={caption}
                    onSave={(v) => updateCaption(i, v)}
                    editable={editable}
                    onActivate={onActivate}
                    placeholder={labels.captionPlaceholder}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
