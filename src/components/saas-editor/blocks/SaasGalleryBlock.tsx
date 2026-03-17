"use client";

import Image from "next/image";
import type { SaasBlock } from "../types";

type GalleryItem = { id?: string; src?: string; alt?: string };

export function SaasGalleryBlock({ block }: { block: SaasBlock }) {
  const title = (block.content.title as string) ?? "";
  const items = (block.content.items as GalleryItem[]) ?? [];
  const style = block.style || {};
  const validItems = items.filter((i) => i?.src);

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-white px-3 py-2 shadow-sm"
      style={{
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
      }}
    >
      {title ? (
        <div className="mb-2 border-b border-slate-100 pb-1.5 text-sm font-semibold text-slate-800">
          {title}
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5 overflow-auto">
        {validItems.length === 0 ? (
          <div className="col-span-2 flex flex-1 items-center justify-center text-xs text-slate-400">
            画像を追加
          </div>
        ) : (
          validItems.slice(0, 6).map((item, i) => (
            <div key={item.id ?? i} className="relative aspect-square overflow-hidden rounded bg-slate-100">
              <Image
                src={item.src!}
                alt={item.alt ?? ""}
                fill
                className="object-cover"
                unoptimized={item.src?.startsWith("http")}
                sizes="120px"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
