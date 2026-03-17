"use client";

import type { SaasBlock } from "../types";

export function SaasNoticeBlock({ block }: { block: SaasBlock }) {
  const title = (block.content.title as string) ?? "お知らせ";
  const body = (block.content.body as string) ?? "";
  const variant = (block.content.variant as string) ?? "info";
  const style = block.style || {};

  const isWarning = variant === "warning";
  const icon = isWarning ? "⚠️" : "📢";
  const bg = isWarning ? "bg-amber-50" : "bg-sky-50/95";
  const border = isWarning ? "border-amber-300" : "border-sky-300";
  const titleColor = isWarning ? "text-amber-900" : "text-sky-900";

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-[16px] border-2 px-6 py-5 ${bg} ${border}`}
      style={{
        backgroundColor: style.backgroundColor ?? undefined,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-white/80 text-xl"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          {icon}
        </span>
        <h3 className={`text-lg font-bold tracking-tight ${titleColor}`}>{title}</h3>
      </div>
      {body && (
        <p className="mt-4 flex-1 overflow-auto text-sm leading-relaxed text-slate-700">{body}</p>
      )}
    </div>
  );
}
