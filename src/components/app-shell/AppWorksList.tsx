"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
  },
};

type AppWorksListProps = {
  children: ReactNode;
  className?: string;
};

/** Staggered list mount for works screen (respects reduced motion). */
export function AppWorksList({ children, className = "" }: AppWorksListProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={"space-y-3 " + className}>{children}</div>;
  }

  return (
    <motion.div
      className={"space-y-3 " + className}
      variants={listVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function AppWorksListItemMotion({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return <motion.div variants={itemVariants}>{children}</motion.div>;
}
