"use client";

import { LineIcon, normalizeIconToken } from "@/components/cards/LineIcon";
import type { SaasBlock } from "../types";

const ACCENT_STYLES: Record<string, string> = {
  amber: "border-l-amber-500 bg-gradient-to-r from-amber-50/95 to-amber-50/80 text-amber-900",
  blue: "border-l-blue-500 bg-gradient-to-r from-blue-50/95 to-blue-50/80 text-blue-900",
  emerald: "border-l-emerald-500 bg-gradient-to-r from-emerald-50/95 to-emerald-50/80 text-emerald-900",
  rose: "border-l-rose-500 bg-gradient-to-r from-rose-50/95 to-rose-50/80 text-rose-900",
  violet: "border-l-violet-500 bg-gradient-to-r from-violet-50/95 to-violet-50/80 text-violet-900",
};

export function SaasHighlightBlock({ block }: { block: SaasBlock }) {
  const iconName = normalizeIconToken(block.content.icon ?? "info", "info");
  const title = (block.content.title as string) ?? "重要なお知らせ";
  const body = (block.content.body as string) ?? "";
  const accent = (block.content.accent as string) ?? "amber";
  const style = block.style || {};
  const accentClass = ACCENT_STYLES[accent] ?? ACCENT_STYLES.amber;

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden rounded-[16px] border-l-4 px-6 py-5 ${accentClass}`}
      style={{
        backgroundColor: style.backgroundColor ?? undefined,
        color: style.color,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-start gap-4">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-white/70 text-slate-700"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
          <LineIcon name={iconName} className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-snug tracking-tight">{title || " "}</h3>
          {body && (
            <p className="mt-3 text-sm leading-relaxed opacity-95">{body}</p>
          )}
        </div>
      </div>
    </div>
  );
}
