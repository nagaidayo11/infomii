"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Shared = {
  label: string;
  icon?: ReactNode;
  /** Span full width in a 2-col grid */
  span?: boolean;
  className?: string;
};

type AsButton = Shared & {
  as?: "button";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

type AsAnchor = Shared & {
  as: "a";
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">;

export type AppLinkTileProps = AsButton | AsAnchor;

/** Soft teal rounded link/action tile (航空券, レンタカー, …). */
export function AppLinkTile(props: AppLinkTileProps) {
  const { label, icon, span = false, className = "", as = "button" } = props;
  const classes =
    "app-link-tile ui-pop-tap " + (span ? "app-link-tile--span " : "") + className;

  const content = (
    <>
      {icon ? <span className="app-link-tile__icon">{icon}</span> : null}
      <span className="app-link-tile__label min-w-0 flex-1">{label}</span>
    </>
  );

  if (as === "a") {
    const { href, ...anchorRest } = props as AsAnchor;
    return (
      <a href={href} className={classes} {...anchorRest}>
        {content}
      </a>
    );
  }

  const buttonProps = props as AsButton;
  const { type = "button", ...rest } = buttonProps;
  return (
    <button type={type} className={classes} {...rest}>
      {content}
    </button>
  );
}

type AppLinkTileGridProps = {
  children: ReactNode;
  className?: string;
};

export function AppLinkTileGrid({ children, className = "" }: AppLinkTileGridProps) {
  return <div className={"app-link-tile-grid " + className}>{children}</div>;
}
