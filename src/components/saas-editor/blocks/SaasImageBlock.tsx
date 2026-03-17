"use client";

import Image from "next/image";
import type { SaasBlock } from "../types";

export function SaasImageBlock({ block }: { block: SaasBlock }) {
  const src = (block.content.src as string) ?? "";
  const alt = (block.content.alt as string) ?? "";
  const style = block.style || {};
  return (
    <div
      className="flex h-full w-full overflow-hidden rounded-lg bg-slate-100"
      style={{
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        padding: style.padding ? `${style.padding}px` : undefined,
      }}
    >
      {src ? (
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            unoptimized={src.startsWith("http")}
            sizes="320px"
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
          画像URLを追加
        </div>
      )}
    </div>
  );
}
