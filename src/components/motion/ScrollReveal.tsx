"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** アニメーションの強さ: subtle | default | strong */
  intensity?: "subtle" | "default" | "strong";
  /** 一度表示したら再アニメーションしない */
  once?: boolean;
};

const variants: Record<string, Variants> = {
  subtle: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  },
  default: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  strong: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
};

/**
 * スクロールでビューポートに入ったときにフェード＋スライドアップで表示。
 * LP・ダッシュボード等の全ページで共通利用。
 */
export function ScrollReveal({
  children,
  className = "",
  intensity = "default",
  once = true,
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const v = variants[intensity];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px 0px -40px 0px" }}
      variants={v}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
