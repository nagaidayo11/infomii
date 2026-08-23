"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppRouteTransitionProps = {
  children: ReactNode;
};

/**
 * Single fade-in when the new route is ready.
 * No exit/wait — that stacked with the top progress bar as a two-step flash.
 */
export function AppRouteTransition({ children }: AppRouteTransitionProps) {
  const pathname = usePathname() ?? "";
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduceMotion ? false : { opacity: 0.55 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-[1] w-full"
    >
      {children}
    </motion.div>
  );
}
