import type { IconBlockData } from "./types";

export type IconBlockProps = {
  data: IconBlockData;
  className?: string;
};

/**
 * Renders icon + label from JSON: { "type": "icon", "icon": "📍", "label": "アクセス" }
 */
export function IconBlock({ data, className = "" }: IconBlockProps) {
  return (
    <div
      className={`flex items-center gap-2 py-2 ${className}`.trim()}
      data-block-type="icon"
    >
      <span className="text-2xl" aria-hidden>
        {data.icon || "·"}
      </span>
      {data.label != null && data.label !== "" && (
        <span className="text-sm text-slate-700">{data.label}</span>
      )}
    </div>
  );
}
