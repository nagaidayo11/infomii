import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  /** Add hover border/shadow (e.g. for feature cards) */
  hover?: boolean;
};

const paddingClass = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

/**
 * SaaS landing page–aligned card.
 * rounded-xl, light border, soft shadow. Optional hover elevation.
 */
export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
}: CardProps) {
  return (
    <div
      className={
        "rounded-xl border border-slate-200/80 bg-white " +
        "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.02)] " +
        "transition-[box-shadow,border-color,transform] duration-200 ease-out " +
        paddingClass[padding] +
        (hover
          ? " hover:border-slate-300/90 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.03)] hover:-translate-y-0.5"
          : "") +
        " " +
        className
      }
    >
      {children}
    </div>
  );
}
