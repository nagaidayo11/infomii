import type { IconBlockData } from "./types";
import { LineIcon, normalizeIconToken } from "@/components/cards/LineIcon";

export type IconBlockProps = {
  data: IconBlockData;
  className?: string;
};

/**
 * Renders icon + label from JSON (icon: LineIcon token e.g. "map-pin", "wifi").
 */
export function IconBlock({ data, className = "" }: IconBlockProps) {
  const desc = data.description?.trim();
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-slate-50/70 p-3 ${className}`.trim()}
      data-block-type="icon"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-700" aria-hidden>
          <LineIcon name={normalizeIconToken(data.icon, "info")} className="h-6 w-6" />
        </span>
        {data.label != null && data.label !== "" && (
          <span className="text-sm font-medium text-slate-800">{data.label}</span>
        )}
      </div>
      {desc && (
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{desc}</p>
      )}
    </div>
  );
}
