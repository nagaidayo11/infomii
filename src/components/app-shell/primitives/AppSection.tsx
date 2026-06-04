"use client";

import type { CSSProperties, ReactNode } from "react";

type AppSectionProps = {
  children: ReactNode;
  className?: string;
  /** Stagger scroll-reveal within the screen */
  revealDelay?: number;
};

/** Section wrapper with scroll-driven fade-in (app shell). */
export function AppSection({ children, className = "", revealDelay = 0 }: AppSectionProps) {
  const style: CSSProperties | undefined =
    revealDelay > 0 ? { transitionDelay: `${revealDelay}ms` } : undefined;

  return (
    <section className={"app-reveal " + className} style={style}>
      {children}
    </section>
  );
}
