"use client";

import type { ReactNode } from "react";

type AppWorksListProps = {
  children: ReactNode;
  className?: string;
};

export function AppWorksList({ children, className = "" }: AppWorksListProps) {
  return <div className={"space-y-3 " + className}>{children}</div>;
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
