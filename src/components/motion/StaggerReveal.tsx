"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Children, isValidElement, type ReactNode } from "react";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

type StaggerRevealProps = {
  children: ReactNode;
  className?: string;
  /** Applied to each staggered item wrapper (e.g. h-full for equal-height grids) */
  itemClassName?: string;
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
  itemClassName = "",
  staggerDelay = 0.08,
  once = true,
}: StaggerRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={className}>
        {Children.map(children, (child) =>
          isValidElement(child) ? <div className={itemClassName}>{child}</div> : child,
        )}
      </div>
    );
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
          <motion.div variants={itemVariants} className={itemClassName}>
            {child}
          </motion.div>
        ) : (
          child
        )
      )}
    </motion.div>
  );
}
