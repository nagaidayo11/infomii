import type { TextBlockData } from "./types";

export type TextBlockProps = {
  data: TextBlockData;
  className?: string;
};

/**
 * Renders text from JSON: { "type": "text", "content": "館内案内" }
 */
export function TextBlock({ data, className = "" }: TextBlockProps) {
  const text = data.content ?? "";
  return (
    <p
      className={`text-base font-medium text-slate-800 ${className}`.trim()}
      data-block-type="text"
    >
      {text || "\u00A0"}
    </p>
  );
}
