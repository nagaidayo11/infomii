"use client";

import Image from "next/image";
import type { SaasBlock } from "../types";

export function SaasImageBlock({ block }: { block: SaasBlock }) {
  const src = (block.content.src as string) ?? "";
  const alt = (block.content.alt as string) ?? "";
  const caption = (block.content.caption as string) ?? "";
  const style = block.style || {};
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-[16px] border border-slate-200/80 bg-slate-100"
      style={{
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="relative min-h-0 flex-1">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            unoptimized={src.startsWith("http")}
            sizes="320px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[16px] border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500" style={{ margin: 8 }}>
            <span className="text-sm font-medium">画像URLを追加</span>
          </div>
        )}
      </div>
      {caption ? (
        <div className="shrink-0 border-t border-slate-100 bg-white/95 px-6 py-3 text-center text-sm text-slate-600">
          {caption}
        </div>
      ) : null}
    </div>
  );
}
