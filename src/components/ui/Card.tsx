import type { CSSProperties, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  /** Add hover border/shadow (e.g. for feature cards) */
  hover?: boolean;
  /** Merged after the default surface; use to tint desk cards. */
  style?: CSSProperties;
};

/** Consistent card padding (symmetric vertical): none | sm | md | lg.
 * Uses guest pad tokens (`.guest-card-pad` / `-sm`) so guest + editor preview align.
 */
const paddingClass = {
  none: "",
  sm: "guest-card-pad-sm",
  md: "guest-card-pad",
  lg: "guest-card-pad",
};

/**
 * Card container: 余白のみで区切り。外枠・影はなし。
 * Radius must be explicit — `rounded-[inherit]` fails when parents are
 * intermediate wrappers without border-radius (FreeformCanvas shells).
 */
export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  style,
}: CardProps) {
  const interactiveClass = hover
    ? "app-interactive ui-pop-card transition-[transform] duration-200 ease-out hover:-translate-y-0.5"
    : "";
  return (
    <div
      style={{
        backgroundColor: "var(--editor-card-surface, var(--editor-block-surface, var(--color-ds-card)))",
        ...style,
      }}
      className={
        "rounded-[var(--guest-card-radius,0.75rem)] " +
        paddingClass[padding] +
        (interactiveClass ? ` ${interactiveClass}` : "") +
        " " +
        className
      }
    >
      {children}
    </div>
  );
}
