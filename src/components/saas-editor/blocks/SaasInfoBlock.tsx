"use client";

import type { SaasBlock } from "../types";
import { CopyButton } from "./CopyButton";

type InfoRow = { id?: string; label?: string; value?: string };

export function SaasInfoBlock({ block }: { block: SaasBlock }) {
  const icon = (block.content.icon as string) ?? "📶";
  const title = (block.content.title as string) ?? "情報";
  const rows = (block.content.rows as InfoRow[]) ?? [];
  const style = block.style || {};
  const validRows = rows.filter((r) => r && (r.label || r.value));

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-[16px] border border-slate-200/80 bg-white"
      style={{
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="shrink-0 flex items-center gap-3 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-xl" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {icon}
        </span>
        <h3 className="text-lg font-semibold tracking-tight text-slate-800">{title || " "}</h3>
      </div>
      <div className="min-h-0 flex-1 space-y-0 overflow-auto">
        {validRows.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6 py-8 text-center text-sm text-slate-400">
            ラベルと値を追加
          </div>
        ) : (
          validRows.map((row, i) => (
            <div
              key={row.id ?? i}
              className="flex items-center justify-between gap-4 border-b border-slate-50 px-6 py-4 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                  {row.label || "—"}
                </span>
                <span className="mt-1 block truncate text-base font-medium text-slate-800">
                  {row.value ?? "—"}
                </span>
              </div>
              {row.value && (
                <CopyButton
                  text={row.value}
                  label="値をコピー"
                  className="shrink-0 rounded-[12px] border border-slate-200 bg-white px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
