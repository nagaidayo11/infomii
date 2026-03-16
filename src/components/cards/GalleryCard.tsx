"use client";

import Image from "next/image";
import type { EditorCard } from "@/components/editor/types";
import { getLocalizedContent } from "@/lib/localized-content";
import type { LocalizedString } from "@/lib/localized-content";
import { Card } from "@/components/ui/Card";

type GalleryItem = { src?: string; alt?: string };

type GalleryCardProps = {
  card: EditorCard;
  isSelected?: boolean;
  locale?: string;
};

export function GalleryCard({ card, isSelected, locale = "ja" }: GalleryCardProps) {
  const content = card.content as Record<string, unknown>;
  const title = getLocalizedContent(content?.title as LocalizedString | undefined, locale);
  const items = (Array.isArray(content?.items) ? content.items : [{ src: "", alt: "" }]) as GalleryItem[];

  return (
    <Card padding="md" className="">
      {title && (
        <p className="mb-3 text-sm font-medium text-slate-800">{title}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {items.slice(0, 6).map((item, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
            {item?.src ? (
              <Image
                src={item.src}
                alt={getLocalizedContent(item.alt as LocalizedString | undefined, locale) || ""}
                fill
                className="object-cover"
                unoptimized={item.src.startsWith("http")}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                画像
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
