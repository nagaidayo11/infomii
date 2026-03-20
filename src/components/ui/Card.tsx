import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  /** Add hover border/shadow (e.g. for feature cards) */
  hover?: boolean;
};

/** Consistent card padding: none | sm (16px) | md (20px) | lg (24px). */
const paddingClass = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
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
