import type { DividerBlockData } from "./types";

export type DividerBlockProps = {
  data: DividerBlockData;
  className?: string;
};

/**
 * Renders divider from JSON: { "type": "divider" }
 */
export function DividerBlock({ data: _data, className = "" }: DividerBlockProps) {
  return (
    <hr
      className={`my-3 border-slate-200 ${className}`.trim()}
      data-block-type="divider"
      role="separator"
    />
  );
}
