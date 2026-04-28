"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

type HorizontalScrollHintProps = {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
  fadeClassName?: string;
};

export function HorizontalScrollHint({
  children,
  className,
  viewportClassName,
  fadeClassName,
}: HorizontalScrollHintProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const updateFadeState = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const canScroll = maxScrollLeft > 1;

    if (!canScroll) {
      setShowLeft(false);
      setShowRight(false);
      return;
    }

    setShowLeft(el.scrollLeft > 2);
    setShowRight(el.scrollLeft < maxScrollLeft - 2);
  }, []);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => updateFadeState());
    const onResize = () => updateFadeState();
    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [updateFadeState]);

  return (
    <div className={className ?? "relative"}>
      <div
        ref={viewportRef}
        className={viewportClassName ?? "overflow-x-auto overscroll-x-contain scroll-smooth"}
        onScroll={updateFadeState}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={`pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-6 bg-gradient-to-r from-white to-transparent transition-opacity duration-200 sm:hidden ${
          showLeft ? "opacity-100" : "opacity-0"
        } ${fadeClassName ?? ""}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute bottom-0 right-0 top-0 z-20 w-6 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 sm:hidden ${
          showRight ? "opacity-100" : "opacity-0"
        } ${fadeClassName ?? ""}`}
      />
    </div>
  );
}
