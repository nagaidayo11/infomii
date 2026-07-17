"use client";

import type { ReactNode } from "react";

type AppSectionHeaderProps = {
  title: ReactNode;
  /** Teal icon (SVG or emoji node) shown before the title */
  icon?: ReactNode;
  /** Optional trailing action (e.g. "+ 追加") */
  trailing?: ReactNode;
  className?: string;
  as?: "h2" | "h3" | "p" | "div";
};

/** Icon + bold title used on native guest sections and settings sheets. */
export function AppSectionHeader({
  title,
  icon,
  trailing,
  className = "",
  as: Tag = "h2",
}: AppSectionHeaderProps) {
  return (
    <div className={"app-section-header " + className}>
      {icon ? <span className="app-section-header__icon">{icon}</span> : null}
      <Tag className="app-section-header__title min-w-0 flex-1">{title}</Tag>
      {trailing ? <div className="ml-auto shrink-0">{trailing}</div> : null}
    </div>
  );
}
