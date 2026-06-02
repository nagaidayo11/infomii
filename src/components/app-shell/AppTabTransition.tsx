"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { appTabIndex, resolveAppTabId, type AppTabId } from "./app-tab-config";

type AppTabTransitionProps = {
  children: ReactNode;
};

function transitionKey(pathname: string, tabId: AppTabId | null): string {
  return tabId ?? `route:${pathname}`;
}

export function AppTabTransition({ children }: AppTabTransitionProps) {
  const pathname = usePathname() ?? "";
  const reduceMotion = useReducedMotion();
  const tabId = resolveAppTabId(pathname);
  const key = transitionKey(pathname, tabId);

  const prevKeyRef = useRef(key);
  const tabIdRef = useRef(tabId);
  const directionRef = useRef(0);

  if (prevKeyRef.current !== key) {
    const prevIdx = appTabIndex(tabIdRef.current);
    const nextIdx = appTabIndex(tabId);
    if (tabIdRef.current && tabId && prevIdx >= 0 && nextIdx >= 0) {
      directionRef.current = nextIdx > prevIdx ? 1 : -1;
    } else {
      directionRef.current = 0;
    }
    prevKeyRef.current = key;
    tabIdRef.current = tabId;
  }

  const slide = reduceMotion ? 0 : 12;
  const duration = reduceMotion ? 0.12 : 0.2;
  const direction = directionRef.current;

  const variants = {
    enter: (d: number) => ({
      opacity: 0,
      x: d * slide,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (d: number) => ({
      opacity: 0,
      x: d * -slide,
    }),
  };

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={key}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-0 w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
