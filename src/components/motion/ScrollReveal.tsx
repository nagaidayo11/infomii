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
  /** 秒。未指定時は intensity に応じた既定値 */
  duration?: number;
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

const durationByIntensity: Record<"subtle" | "default" | "strong", number> = {
  subtle: 0.45,
  default: 0.55,
  strong: 0.75,
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
  duration,
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
      viewport={{ once, margin: "-12% 0px -8% 0px" }}
      variants={v}
      transition={{
        duration: duration ?? durationByIntensity[intensity],
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
