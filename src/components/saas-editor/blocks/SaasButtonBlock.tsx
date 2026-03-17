"use client";

import type { SaasBlock } from "../types";

export function SaasButtonBlock({ block }: { block: SaasBlock }) {
  const label = (block.content.label as string) ?? "ボタン";
  const href = (block.content.href as string) ?? "#";
  const style = block.style || {};

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] px-6"
      style={{
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
      }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full max-w-sm items-center justify-center rounded-[16px] px-8 py-4 text-base font-semibold text-white transition hover:opacity-95"
        style={{
          backgroundColor: style.backgroundColor ?? "#0f172a",
          color: style.color ?? "#fff",
          fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
          boxShadow: "0 4px 14px rgba(15,23,42,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {label}
      </a>
    </div>
  );
}
