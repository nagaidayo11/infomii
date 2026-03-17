"use client";

import Image from "next/image";
import type { EditorCard } from "@/components/editor/types";
import { InlineEditable } from "@/components/editor/InlineEditable";
import { ImageUpload } from "@/components/editor/ImageUpload";
import { useEditor2Store } from "@/components/editor/store";

type HeroCardProps = { card: EditorCard; isSelected?: boolean; locale?: string };

export function HeroCard({ card, isSelected = false }: HeroCardProps) {
  const updateCard = useEditor2Store((s) => s.updateCard);
  const selectCard = useEditor2Store((s) => s.selectCard);
  const c = card.content as Record<string, unknown> | undefined;
  const title = (c?.title as string) ?? "Infomii Hotel";
  const image = (c?.image as string) ?? "";
  const subtitle = (c?.subtitle as string) ?? "";

  const update = (key: string, value: string) => {
    updateCard(card.id, { content: { ...c, [key]: value } });
  };
  const onActivate = () => selectCard(card.id);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-lg"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
    >
      <div className="relative aspect-[2/1] min-h-[140px] w-full">
        {image ? (
          <Image src={image} alt="" fill className="object-cover" unoptimized={image.startsWith("http")} sizes="420px" />
        ) : (
          <ImageUpload onUploaded={(url) => update("image", url)} className="h-full min-h-[140px]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h2 className="text-xl font-bold leading-tight">
          <InlineEditable value={title} onSave={(v) => update("title", v)} editable={isSelected} onActivate={onActivate} className="text-white" placeholder="タイトル" />
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm opacity-95">
            <InlineEditable value={subtitle} onSave={(v) => update("subtitle", v)} editable={isSelected} onActivate={onActivate} className="text-white/95" placeholder="サブタイトル" />
          </p>
        )}
      </div>
    </div>
  );
}
