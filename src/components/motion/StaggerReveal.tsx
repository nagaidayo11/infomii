"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Children, isValidElement, type ReactNode } from "react";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type StaggerRevealProps = {
  children: ReactNode;
  className?: string;
  /** 子要素の遅延（秒） */
  staggerDelay?: number;
  /** 一度表示したら再アニメーションしない */
  once?: boolean;
};

/**
 * 子要素を順番にスタッガー表示。スクロールでビューポートに入ったときに発火。
 * 各子要素は motion.div でラップされ、フェード＋スライドアップする。
 */
export function StaggerReveal({
  children,
  className = "",
  staggerDelay = 0.08,
  once = true,
}: StaggerRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px 0px -40px 0px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {Children.map(children, (child) =>
        isValidElement(child) ? (
          <motion.div variants={itemVariants}>{child}</motion.div>
        ) : (
          child
        )
      )}
    </motion.div>
  );
}
