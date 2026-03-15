"use client";

import Image from "next/image";
import type { EditorCard } from "@/components/editor/types";
import { Card } from "@/components/ui/Card";

type ImageCardProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export function ImageCard({ card, isSelected }: ImageCardProps) {
  const src = (card.content?.src as string | undefined) ?? "";
  const alt = (card.content?.alt as string | undefined) ?? "";
  return (
    <Card padding="none" className={isSelected ? "ring-2 ring-ds-primary ring-offset-2 ring-offset-ds-bg" : ""}>
      {src ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
          <Image src={src} alt={alt} fill className="object-cover" unoptimized={src.startsWith("http")} />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
          画像URLを入力
        </div>
      )}
    </Card>
  );
}
