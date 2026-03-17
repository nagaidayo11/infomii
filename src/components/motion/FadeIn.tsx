"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  /** 遅延（秒） */
  delay?: number;
  /** 持続時間（秒） */
  duration?: number;
};

/**
 * マウント時にフェードイン。ヒーロー等の初回表示用。
 */
export function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
}: FadeInProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
