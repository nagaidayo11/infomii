"use client";

import type { SaasBlock } from "../types";

export function SaasButtonBlock({ block }: { block: SaasBlock }) {
  const label = (block.content.label as string) ?? "Button";
  const href = (block.content.href as string) ?? "#";
  const style = block.style || {};
  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg px-3 py-2"
      style={{
        backgroundColor: style.backgroundColor ?? "var(--ds-primary)",
        color: style.color ?? "#fff",
        fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        padding: style.padding ? `${style.padding}px` : undefined,
      }}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium no-underline"
        onClick={(e) => e.stopPropagation()}
      >
        {label}
      </a>
    </div>
  );
}
