"use client";

import Image from "next/image";
import type { SaasBlock } from "../types";

type GalleryItem = { id?: string; src?: string; alt?: string; caption?: string };

export function SaasGalleryBlock({ block }: { block: SaasBlock }) {
  const title = (block.content.title as string) ?? "";
  const items = (block.content.items as GalleryItem[]) ?? [];
  const style = block.style || {};
  const validItems = items.filter((i) => i?.src);

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-[16px] border border-slate-200/80 bg-white"
      style={{
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {title ? (
        <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <h3 className="text-lg font-semibold tracking-tight text-slate-800">{title}</h3>
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 overflow-auto p-6">
        {validItems.length === 0 ? (
          <div
            className="col-span-2 flex flex-1 flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-slate-200 bg-slate-50/80 text-slate-400"
            style={{ margin: 4 }}
          >
            <span className="text-3xl">🖼️</span>
            <span className="text-sm font-medium">画像を追加</span>
          </div>
        ) : (
          validItems.slice(0, 6).map((item, i) => (
            <div
              key={item.id ?? i}
              className="flex flex-col overflow-hidden rounded-[12px] border border-slate-100 bg-slate-50/50"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.src!}
                  alt={item.alt ?? ""}
                  fill
                  className="object-cover"
                  unoptimized={item.src?.startsWith("http")}
                  sizes="160px"
                />
              </div>
              {item.caption ? (
                <p className="shrink-0 px-4 py-3 text-sm font-medium text-slate-600">{item.caption}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
