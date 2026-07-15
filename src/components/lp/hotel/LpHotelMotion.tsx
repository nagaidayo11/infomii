"use client";

import { Children, isValidElement, type ReactNode, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Clip-up line reveal (Elastic-style text entrance). */
export function ClipReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.85,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "110%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Word-by-word stagger for short headlines. */
export function WordReveal({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const words = text.split(/(\s+)/);

  if (reduceMotion) return <span className={className}>{text}</span>;

  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) =>
        word.trim() === "" ? (
          <span key={`ws-${i}`}>{word}</span>
        ) : (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.55, delay: delay + i * 0.045, ease: EASE }}
            >
              {word}
            </motion.span>
          </span>
        ),
      )}
    </span>
  );
}

/** Neon-ish rounded rect that draws on scroll (teal gradient stroke). */
export function ScrollDrawFrame({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const pathLength = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        <svg className="h-full w-full" viewBox="0 0 320 560" fill="none" aria-hidden>
          <rect x="8" y="8" width="304" height="544" rx="40" stroke="rgba(45,212,191,0.45)" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <svg className="h-full w-full" viewBox="0 0 320 560" fill="none" aria-hidden>
        <defs>
          <linearGradient id="lp-draw-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="50%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <motion.rect
          x="8"
          y="8"
          width="304"
          height="544"
          rx="40"
          stroke="url(#lp-draw-stroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>
    </div>
  );
}

/** Horizontal marquee for trust / scene chips. */
export function MotionMarquee({
  children,
  className = "",
  duration = 28,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();
  const items = Children.toArray(children).filter(isValidElement);

  if (reduceMotion || items.length === 0) {
    return <div className={`flex flex-wrap justify-center gap-3 ${className}`}>{children}</div>;
  }

  const track = [...items, ...items];

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex w-max gap-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {track.map((child, i) => (
          <div key={i} className="shrink-0">
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const floatVariants: Variants = {
  idle: {
    y: [0, -10, 0],
    rotate: [0, -1.2, 0.8, 0],
    transition: { duration: 5.5, ease: "easeInOut", repeat: Infinity },
  },
};

/** Soft floating after mount (phone / product). */
export function FloatDrift({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={floatVariants} animate="idle">
      {children}
    </motion.div>
  );
}

/** Progress line that fills as the section scrolls through the viewport. */
export function ScrollProgressLine({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 28 });

  return (
    <div ref={ref} className={`h-px w-full origin-left overflow-hidden bg-emerald-100 ${className}`}>
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300"
        style={reduceMotion ? { scaleX: 1 } : { scaleX }}
      />
    </div>
  );
}

/** Cards that tilt slightly toward pointer (desktop). */
export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      whileHover={{ y: -6, scale: 1.015, rotateX: 2, rotateY: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      style={{ transformPerspective: 800 }}
    >
      {children}
    </motion.div>
  );
}

/** Soft scroll-in before → after pairs (no sticky / large pan). */
export function StickyBeforeAfter({
  rows,
}: {
  rows: readonly { before: string; after: string }[];
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className="grid gap-4">
        {rows.map((row) => (
          <div
            key={row.before}
            className="grid overflow-hidden rounded-2xl border border-slate-200/90 bg-white sm:grid-cols-2"
          >
            <div className="bg-slate-50 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Before</p>
              <p className="mt-2 text-sm font-medium text-slate-600">{row.before}</p>
            </div>
            <div className="bg-emerald-50/70 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">After</p>
              <p className="mt-2 text-sm font-semibold text-emerald-900">{row.after}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {rows.map((row, index) => (
        <SoftBeforeAfterRow key={row.before} row={row} index={index} />
      ))}
    </div>
  );
}

function SoftBeforeAfterRow({
  row,
  index,
}: {
  row: { before: string; after: string };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: EASE }}
      className="group grid overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100 transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md sm:grid-cols-[1fr_auto_1fr]"
    >
      <div className="border-b border-slate-100 bg-slate-50/90 px-5 py-4 sm:border-b-0 sm:border-r">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Before</p>
        <p className="mt-2 text-sm font-medium text-slate-600">{row.before}</p>
      </div>
      <div
        className="hidden items-center justify-center bg-gradient-to-b from-slate-50 to-emerald-50/40 px-2 sm:flex"
        aria-hidden
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200 transition duration-300 group-hover:scale-105">
          →
        </span>
      </div>
      <div className="bg-emerald-50/60 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">After</p>
        <p className="mt-2 text-sm font-semibold text-emerald-900">{row.after}</p>
      </div>
    </motion.div>
  );
}

/** Scale-blur stagger for feature grids. */
export function FancyStagger({
  children,
  className = "",
  itemClassName = "",
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  const reduceMotion = useReducedMotion();
  const variants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 36, scale: 0.94, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.65, ease: EASE },
    },
  };

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
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={variants}
    >
      {Children.map(children, (child) =>
        isValidElement(child) ? (
          <motion.div className={itemClassName} variants={item}>
            {child}
          </motion.div>
        ) : (
          child
        ),
      )}
    </motion.div>
  );
}
