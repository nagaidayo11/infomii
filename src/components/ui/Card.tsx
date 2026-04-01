import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  /** Add hover border/shadow (e.g. for feature cards) */
  hover?: boolean;
};

/** Consistent card padding (compact): none | sm (12px) | md (16px) | lg (16px). */
const paddingClass = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-4",
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
      style={{ backgroundColor: "var(--editor-block-surface, #ffffff)" }}
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
