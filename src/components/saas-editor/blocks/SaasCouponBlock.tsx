"use client";

import type { SaasBlock } from "../types";

export function SaasCouponBlock({ block }: { block: SaasBlock }) {
  const title = (block.content.title as string) ?? "クーポン";
  const code = (block.content.code as string) ?? "";
  const description = (block.content.description as string) ?? "";
  const validUntil = (block.content.validUntil as string) ?? "";
  const style = block.style || {};

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/80 px-3 py-2"
      style={{
        backgroundColor: style.backgroundColor ?? undefined,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
      }}
    >
      <div className="text-sm font-bold text-amber-800">{title}</div>
      {code && (
        <div className="mt-1.5 font-mono text-lg font-bold tracking-wider text-amber-900">
          {code}
        </div>
      )}
      {description && <div className="mt-1 text-xs text-amber-800">{description}</div>}
      {validUntil && (
        <div className="mt-auto pt-1 text-xs text-amber-700">有効期限: {validUntil}</div>
      )}
    </div>
  );
}
