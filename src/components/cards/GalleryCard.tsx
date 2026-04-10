"use client";

import Image from "next/image";
import type { EditorCard } from "@/components/editor/types";
import { getTitleFontSizeStyle, getBodyFontSizeStyle } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { editorInnerRadiusClassName } from "@/components/editor/inner-radius";
import { Card } from "@/components/ui/Card";
import { useEditor2Store } from "@/components/editor/store";

type GalleryItem = { src?: string; alt?: string };

type GalleryCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

function isLocalizedObj(v: unknown): v is Record<string, string> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && ("ja" in v || "en" in v);
}

export function GalleryCard({ card, isSelected, locale = "ja" }: GalleryCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const content = card.content as Record<string, unknown>;
  const title = getLocalizedContent(content?.title as LocalizedString | undefined, locale);
  const items = (Array.isArray(content?.items) ? content.items : [{ src: "", alt: "" }]) as GalleryItem[];
  const rawColumns = typeof content?.columns === "number" ? content.columns : Number(content?.columns);
  const columns = rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 2;
  const labels =
    locale === "ko"
      ? { emptyImage: "이미지", titlePlaceholder: "갤러리" }
      : locale === "zh"
        ? { emptyImage: "图片", titlePlaceholder: "图库" }
        : locale === "en"
          ? { emptyImage: "Image", titlePlaceholder: "Gallery" }
          : { emptyImage: "画像", titlePlaceholder: "ギャラリー" };

  const updateKey = (key: string, nextValue: string) => {
    const cur = content?.[key];
    const next = isLocalizedObj(cur) ? { ...cur, ja: nextValue } : nextValue;
    updateCard(card.id, { content: { ...content, [key]: next } });
  };
  const onActivate = () => selectCard(card.id);

  return (
    <Card padding="md" className="">
      <p className="mb-3 font-medium text-slate-800" style={getTitleFontSizeStyle()}>
        <InlineEditable value={title} onSave={(v) => updateKey("title", v)} editable={isSelected} onActivate={onActivate} className="font-medium text-slate-800" placeholder={labels.titlePlaceholder} />
      </p>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {items.slice(0, 12).map((item, i) => (
          <div key={i} data-inner-surface className={`relative aspect-square overflow-hidden ${editorInnerRadiusClassName} bg-slate-100`}>
            {item?.src ? (
              <Image
                src={item.src}
                alt={getLocalizedContent(item.alt as LocalizedString | undefined, locale) || ""}
                fill
                className="object-cover"
                unoptimized={item.src.startsWith("http")}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400" style={getBodyFontSizeStyle()}>
                {labels.emptyImage}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
