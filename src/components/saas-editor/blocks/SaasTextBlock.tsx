"use client";

import type { SaasBlock } from "../types";

export function SaasTextBlock({ block }: { block: SaasBlock }) {
  const content = (block.content.content as string) ?? "ここに入力...";
  const variant = (block.content.variant as string) ?? "body";
  const style = block.style || {};
  const isHeading = variant === "heading";

  return (
    <div
      className="flex h-full w-full flex-col justify-center overflow-hidden rounded-[16px] px-6 py-5"
      style={{
        backgroundColor: style.backgroundColor ?? "transparent",
        color: style.color,
        fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
        fontWeight: style.fontWeight,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        padding: style.padding ? `${style.padding}px` : undefined,
      }}
    >
      {isHeading ? (
        <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-800">
          {content || "\u00A0"}
        </h2>
      ) : (
        <p className="text-base leading-relaxed text-slate-700">{content || "\u00A0"}</p>
      )}
    </div>
  );
}
