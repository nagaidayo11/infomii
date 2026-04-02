import type { ReactNode } from "react";
import type { InformationBlock } from "@/types/information";
import { LineIcon, normalizeIconToken } from "@/components/cards/LineIcon";

export function informationIconLineClass(size: InformationBlock["iconSize"] | undefined): string {
  if (size === "sm") return "h-4 w-4";
  if (size === "lg") return "h-6 w-6";
  if (size === "xl") return "h-7 w-7";
  return "h-5 w-5";
}

/** LineIcon に未実装の旧 svg: トークンのみ（SVG で描画） */
function renderExtraLegacySvg(token: string, className: string): ReactNode {
  const t = token.trim().toLowerCase();
  if (t === "svg:wheelchair") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="18" r="3" />
        <circle cx="13" cy="5" r="1.2" />
        <path d="M13 7v5h3l2 4h-5" />
        <path d="M9 15h6" />
      </svg>
    );
  }
  if (t === "svg:paw") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="7" cy="8" r="1.5" />
        <circle cx="11" cy="6.5" r="1.5" />
        <circle cx="15" cy="6.5" r="1.5" />
        <circle cx="17" cy="9" r="1.5" />
        <path d="M9 17c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.4-1 2-2.3 2H11c-1.2 0-2-.7-2-2Z" />
      </svg>
    );
  }
  if (t === "svg:plug") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 3v6M15 3v6M7 9h10v2a5 5 0 0 1-5 5v5" />
      </svg>
    );
  }
  return null;
}

/**
 * 施設ページ・プレビュー用。絵文字ではなく LineIcon（SVG）で統一。
 */
export function renderInformationIconVisual(
  icon: string | undefined,
  size: InformationBlock["iconSize"] | undefined,
): ReactNode {
  const dimClass = informationIconLineClass(size);
  const className = `${dimClass} text-slate-700`;
  const trimmed = icon?.trim();
  if (!trimmed) {
    return <LineIcon name="info" className={className} />;
  }
  const extra = renderExtraLegacySvg(trimmed, className);
  if (extra != null) return extra;
  const name = normalizeIconToken(trimmed, "info");
  return <LineIcon name={name} className={className} />;
}
