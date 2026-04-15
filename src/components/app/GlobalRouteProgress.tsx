"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SHOW_DELAY_MS = 50;
const HIDE_FADE_MS = 120;
const TRICKLE_TICK_MS = 120;
const TRICKLE_MAX = 70;

function isSameOriginNavigation(href: string) {
  if (typeof window === "undefined") return false;
  try {
    const target = new URL(href, window.location.href);
    return target.origin === window.location.origin;
  } catch {
    return false;
  }
}

function normalizeHistoryUrl(url: string | URL | null | undefined): string | null {
  if (!url) return null;
  if (typeof url === "string") return url;
  if (url instanceof URL) return url.toString();
  return null;
}

export function GlobalRouteProgress({ manualPending = false }: { manualPending?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname ?? ""}?${searchParams?.toString() ?? ""}`;

  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const trickleTimerRef = useRef<number | null>(null);
  const startRafRef = useRef<number | null>(null);
  const lastRouteKeyRef = useRef(routeKey);
  const routePendingRef = useRef(false);
  const isPendingRef = useRef(false);
  const isVisibleRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const [isPending, setIsPending] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [routePending, setRoutePending] = useState(false);

  const clearAllTimers = useCallback(() => {
    if (showTimerRef.current) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (trickleTimerRef.current) {
      window.clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }
    if (startRafRef.current) {
      window.cancelAnimationFrame(startRafRef.current);
      startRafRef.current = null;
    }
  }, []);

  const startPending = useCallback(() => {
    if (isPendingRef.current) return;
    isPendingRef.current = true;
    setIsPending(true);
    setIsFinishing(false);
    setProgress(0);
    showTimerRef.current = window.setTimeout(() => {
      isVisibleRef.current = true;
      setIsVisible(true);
      setProgress(6);
      if (reducedMotionRef.current) return;
      trickleTimerRef.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= TRICKLE_MAX) return prev;
          const next = prev + (TRICKLE_MAX - prev) * 0.18;
          return Math.min(TRICKLE_MAX, next);
        });
      }, TRICKLE_TICK_MS);
    }, SHOW_DELAY_MS);
  }, []);

  const finishPending = useCallback(() => {
    if (!isPendingRef.current) return;
    if (!isVisibleRef.current) {
      clearAllTimers();
      isPendingRef.current = false;
      setIsPending(false);
      setProgress(0);
      setIsFinishing(false);
      return;
    }
    clearAllTimers();
    setProgress(100);
    setIsFinishing(true);
    hideTimerRef.current = window.setTimeout(() => {
      isVisibleRef.current = false;
      isPendingRef.current = false;
      setIsVisible(false);
      setIsPending(false);
      setIsFinishing(false);
      setProgress(0);
    }, HIDE_FADE_MS);
  }, [clearAllTimers]);

  const scheduleStartPending = useCallback(() => {
    if (startRafRef.current) return;
    startRafRef.current = window.requestAnimationFrame(() => {
      startRafRef.current = null;
      if (routePendingRef.current) return;
      routePendingRef.current = true;
      setRoutePending(true);
    });
  }, []);

  const scheduleStopRoutePending = useCallback(() => {
    if (startRafRef.current) {
      window.cancelAnimationFrame(startRafRef.current);
      startRafRef.current = null;
    }
    window.requestAnimationFrame(() => {
      routePendingRef.current = false;
      setRoutePending(false);
    });
  }, []);

  useEffect(() => {
    isPendingRef.current = isPending;
  }, [isPending]);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedMotionRef.current = media.matches;
      setReducedMotion(media.matches);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const prev = lastRouteKeyRef.current;
    if (prev !== routeKey) {
      lastRouteKeyRef.current = routeKey;
      scheduleStopRoutePending();
    }
  }, [routeKey, scheduleStopRoutePending]);

  useEffect(() => {
    const effectivePending = routePending || manualPending;
    if (effectivePending) {
      window.requestAnimationFrame(() => startPending());
      return;
    }
    window.requestAnimationFrame(() => finishPending());
  }, [finishPending, manualPending, routePending, startPending]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (!isSameOriginNavigation(href)) return;
      const next = new URL(href, window.location.href);
      const current = `${window.location.pathname}${window.location.search}`;
      const incoming = `${next.pathname}${next.search}`;
      if (current === incoming) return;
      scheduleStartPending();
    };

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = ((...args: Parameters<History["pushState"]>) => {
      const historyUrl = normalizeHistoryUrl(args[2]);
      if (historyUrl && isSameOriginNavigation(historyUrl)) {
        scheduleStartPending();
      }
      return originalPushState(...args);
    }) as History["pushState"];

    window.history.replaceState = ((...args: Parameters<History["replaceState"]>) => {
      const historyUrl = normalizeHistoryUrl(args[2]);
      if (historyUrl && isSameOriginNavigation(historyUrl)) {
        scheduleStartPending();
      }
      return originalReplaceState(...args);
    }) as History["replaceState"];

    const onPopState = () => scheduleStartPending();
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onDocumentClick, true);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onDocumentClick, true);
      clearAllTimers();
    };
  }, [clearAllTimers, scheduleStartPending]);

  return (
    <>
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-[160] h-[2px] transition-opacity ${
          reducedMotion ? "duration-0" : "duration-120"
        } ${isVisible ? "opacity-100" : "opacity-0"} ${isFinishing ? "opacity-0" : ""}`}
        aria-hidden
      >
        <div
          className="h-full origin-left bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.35)] transition-[transform] duration-120 ease-out"
          style={{
            transform: `scaleX(${Math.max(0, Math.min(1, progress / 100))})`,
            transitionDuration: reducedMotion ? "0ms" : undefined,
          }}
        />
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {isPending ? "読み込み中" : ""}
      </span>
    </>
  );
}
