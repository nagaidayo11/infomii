import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddingClass = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

/**
 * SaaS landing page–aligned card.
 * rounded-xl, light border (border-slate-200/80), soft shadow.
 */
export function Card({
  children,
  className = "",
  padding = "md",
}: CardProps) {
  return (
    <div
      className={
        "rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] " +
        paddingClass[padding] +
        " " +
        className
      }
    >
      {children}
    </div>
  );
}
