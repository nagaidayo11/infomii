import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  /** Add hover border/shadow (e.g. for feature cards) */
  hover?: boolean;
};

/** Consistent card padding (symmetric vertical): none | sm | md | lg. */
const paddingClass = {
  none: "",
  sm: "px-3 py-2.5",
  md: "px-4 py-3",
  lg: "px-4 py-3",
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
  return (
    <div
      style={{ backgroundColor: "var(--editor-block-surface, var(--color-ds-card))" }}
      className={
        "app-interactive rounded-[inherit] " +
        "transition-[transform] duration-200 ease-out " +
        paddingClass[padding] +
        (hover ? " hover:-translate-y-0.5" : "") +
        " " +
        className
      }
    >
      {children}
    </div>
  );
}
