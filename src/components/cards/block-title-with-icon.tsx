"use client";

import type { CSSProperties, ReactNode } from "react";
import { LineIcon, normalizeIconToken, type LineIconName } from "./LineIcon";

/** Title row with optional line icon (no chip/frame). */
export function BlockTitleWithIcon({
  icon,
  fallbackIcon,
  titleClassName,
  titleStyle,
  children,
}: {
  /** Raw content.icon — empty hides icon unless fallbackIcon is set. */
  icon?: unknown;
  fallbackIcon?: LineIconName;
  titleClassName: string;
  titleStyle?: CSSProperties;
  children: ReactNode;
}) {
  const raw = typeof icon === "string" ? icon.trim() : "";
  const showIcon = Boolean(raw) || Boolean(fallbackIcon);
  const name = showIcon ? normalizeIconToken(raw || fallbackIcon, fallbackIcon ?? "info") : null;

  if (!name) {
    return (
      <p className={titleClassName} style={titleStyle}>
        {children}
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex shrink-0 text-slate-600" aria-hidden>
        <LineIcon name={name} className="h-[1.15em] w-[1.15em]" style={titleStyle} />
      </span>
      <p className={`min-w-0 flex-1 ${titleClassName}`} style={titleStyle}>
        {children}
      </p>
    </div>
  );
}
