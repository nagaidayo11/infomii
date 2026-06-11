"use client";

import type { ReactNode } from "react";

type AppWorksListProps = {
  children: ReactNode;
  className?: string;
  /** Single inset card with dividers (iOS grouped list). */
  variant?: "cards" | "grouped";
};

export function AppWorksList({ children, className = "", variant = "cards" }: AppWorksListProps) {
  return (
    <div
      className={
        (variant === "grouped" ? "app-works-list app-works-list--grouped " : "app-works-list ") + className
      }
    >
      {children}
    </div>
  );
}

type AppWorksListItemMotionProps = {
  children: ReactNode;
  /** Stagger scroll-reveal (ms) */
  index?: number;
};

export function AppWorksListItemMotion({ children, index = 0 }: AppWorksListItemMotionProps) {
  const delay = Math.min(index, 10) * 45;
  return (
    <div className="app-reveal" style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
