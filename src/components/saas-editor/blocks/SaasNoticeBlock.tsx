"use client";

import type { SaasBlock } from "../types";

export function SaasNoticeBlock({ block }: { block: SaasBlock }) {
  const title = (block.content.title as string) ?? "お知らせ";
  const body = (block.content.body as string) ?? "";
  const variant = (block.content.variant as string) ?? "info";
  const style = block.style || {};

  const isWarning = variant === "warning";
  const bg = isWarning ? "bg-amber-50" : "bg-sky-50/90";
  const border = isWarning ? "border-amber-200" : "border-sky-200";

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-lg border px-3 py-2 ${bg} ${border}`}
      style={{
        backgroundColor: style.backgroundColor ?? undefined,
        color: style.color,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
      }}
    >
      <div className="text-sm font-semibold text-slate-800">{title}</div>
      {body && <div className="mt-1 flex-1 overflow-auto text-xs text-slate-700">{body}</div>}
    </div>
  );
}
