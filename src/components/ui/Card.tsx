import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  /** Add hover border/shadow (e.g. for feature cards) */
  hover?: boolean;
};

/** Consistent card padding (symmetric vertical): none | sm | md | lg.
 * Horizontal inset matches 見出し＋本文セット (`px-3`).
 */
const paddingClass = {
  none: "",
  sm: "px-3 py-2.5",
  md: "px-3 py-3",
  lg: "px-3 py-3",
};

/**
 * Card container: 余白のみで区切り。外枠・影はなし。
 */
export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
}: CardProps) {
  const interactiveClass = hover
    ? "app-interactive ui-pop-card transition-[transform] duration-200 ease-out hover:-translate-y-0.5"
    : "";
  return (
    <div
      style={{ backgroundColor: "var(--editor-card-surface, var(--editor-block-surface, var(--color-ds-card)))" }}
      className={
        "rounded-[inherit] " +
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
