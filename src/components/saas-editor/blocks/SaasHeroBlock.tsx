"use client";

import Image from "next/image";
import type { SaasBlock } from "../types";

export function SaasHeroBlock({ block }: { block: SaasBlock }) {
  const imageSrc = (block.content.imageSrc as string) ?? "";
  const title = (block.content.title as string) ?? "タイトル";
  const subtitle = (block.content.subtitle as string) ?? "";
  const overlay = (block.content.overlay as boolean) !== false;
  const style = block.style || {};

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[16px]"
      style={{
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}
    >
      <div className="relative flex-1 min-h-0 bg-slate-200">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover"
            unoptimized={imageSrc.startsWith("http")}
            sizes="520px"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center rounded-[16px] border-2 border-dashed border-slate-300 bg-slate-100 text-slate-500"
            style={{ margin: 8 }}
          >
            <span className="text-sm font-medium">画像URLを追加</span>
          </div>
        )}
        {imageSrc && overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        )}
      </div>
      <div
        className={`shrink-0 px-6 py-6 ${overlay && imageSrc ? "absolute bottom-0 left-0 right-0 text-white" : "bg-white"}`}
      >
        <h2
          className="text-2xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl"
          style={{ color: overlay && imageSrc ? undefined : style.color }}
        >
          {title || " "}
        </h2>
        {subtitle && (
          <p className={`mt-3 text-base leading-relaxed opacity-95 ${overlay && imageSrc ? "text-white/95" : "text-slate-600"}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
