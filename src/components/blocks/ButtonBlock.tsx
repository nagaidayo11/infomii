import type { ButtonBlockData } from "./types";

export type ButtonBlockProps = {
  data: ButtonBlockData;
  className?: string;
};

/**
 * Renders CTA from JSON: { "type": "button", "label": "WiFiを見る", "href": "#" }
 */
export function ButtonBlock({ data, className = "" }: ButtonBlockProps) {
  const label = data.label?.trim() || "ボタン";
  const href = data.href?.trim();
  const hasLink = href && href !== "#";

  const inner = (
    <span
      className={`inline-flex w-full items-center justify-center rounded-xl bg-ds-primary px-4 py-3 text-sm font-medium text-white shadow-sm ${className}`.trim()}
    >
      {label}
    </span>
  );

  if (hasLink) {
    return (
      <a
        href={href}
        className="my-2 block w-full no-underline"
        data-block-type="button"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="my-2 w-full" data-block-type="button">
      {inner}
    </div>
  );
}
