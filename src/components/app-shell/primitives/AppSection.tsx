"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type AppSectionProps = {
  children: ReactNode;
  className?: string;
};

/** Section wrapper with one-time fade-in on mount (app shell). */
export function AppSection({ children, className = "" }: AppSectionProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}
