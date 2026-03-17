"use client";

import type { SaasBlock } from "../types";
import { CopyButton } from "./CopyButton";

export function SaasCouponBlock({ block }: { block: SaasBlock }) {
  const title = (block.content.title as string) ?? "クーポン";
  const code = (block.content.code as string) ?? "";
  const description = (block.content.description as string) ?? "";
  const validUntil = (block.content.validUntil as string) ?? "";
  const style = block.style || {};

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-[16px] border-2 border-dashed border-amber-400 bg-gradient-to-br from-amber-50 via-amber-50/95 to-amber-100/90 px-6 py-5"
      style={{
        backgroundColor: style.backgroundColor ?? undefined,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-amber-700">{title}</div>
      {code && (
        <div className="mt-4 flex items-center gap-3">
          <div
            className="min-w-0 flex-1 rounded-[12px] bg-white/95 px-5 py-3.5 font-mono text-lg font-bold tracking-widest text-amber-900"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            {code}
          </div>
          <CopyButton
            text={code}
            label="コードをコピー"
            className="shrink-0 rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 hover:bg-amber-100"
          />
        </div>
      )}
      {description && (
        <p className="mt-4 text-sm leading-relaxed text-amber-800/90">{description}</p>
      )}
      {validUntil && (
        <div className="mt-auto pt-4 text-xs font-medium text-amber-700">有効期限: {validUntil}</div>
      )}
    </div>
  );
}
