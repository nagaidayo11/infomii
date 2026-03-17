"use client";

import type { SaasBlock } from "../types";

type MenuItem = { id?: string; name?: string; price?: string; description?: string };

export function SaasMenuBlock({ block }: { block: SaasBlock }) {
  const title = (block.content.title as string) ?? "Menu";
  const items = (block.content.items as MenuItem[]) ?? [];
  const style = block.style || {};
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-white px-3 py-2 shadow-sm"
      style={{
        backgroundColor: style.backgroundColor,
        borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
        padding: style.padding ? `${style.padding}px` : undefined,
      }}
    >
      <div className="border-b border-slate-200 pb-1.5 text-sm font-semibold text-slate-800">
        {title}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="mt-1 text-xs text-slate-500">Add items in settings</p>
        ) : (
          <ul className="mt-1 space-y-1 text-xs text-slate-700">
            {items.map((item, i) => (
              <li key={item.id ?? i} className="flex justify-between gap-2">
                <span>{item.name || "—"}</span>
                <span className="shrink-0 font-medium">{item.price || ""}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
