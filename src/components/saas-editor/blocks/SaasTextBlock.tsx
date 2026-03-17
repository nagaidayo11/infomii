"use client";

import type { SaasBlock } from "../types";

export function SaasTextBlock({ block }: { block: SaasBlock }) {
  const content = (block.content.content as string) ?? "Type here...";
  const style = block.style || {};
  return (
    <div
      className="flex h-full w-full items-center overflow-hidden rounded-lg px-3 py-2"
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
        fontWeight: style.fontWeight,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        padding: style.padding ? `${style.padding}px` : undefined,
      }}
    >
      <span className="truncate">{content || "\u00A0"}</span>
    </div>
  );
}
