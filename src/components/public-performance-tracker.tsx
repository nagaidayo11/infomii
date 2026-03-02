"use client";

import { useEffect, useRef } from "react";

type PublicPerformanceTrackerProps = {
  hotelId: string | null;
  slug: string;
};

type PerfMetricPayload = {
  name: "lcp" | "load" | "cls" | "inp";
  value: number;
};

export function PublicPerformanceTracker({ hotelId, slug }: PublicPerformanceTrackerProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!hotelId || sentRef.current) {
      return;
    }

    let lcpMs = 0;
    let clsScore = 0;
    let inpMs = 0;
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const loadMsRaw = nav?.loadEventEnd || nav?.domContentLoadedEventEnd || 0;
    const loadMs = Math.round(loadMsRaw);
    const observer = typeof PerformanceObserver !== "undefined"
      ? new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const last = entries[entries.length - 1];
          if (last) {
            lcpMs = Math.round(last.startTime);
          }
        })
      : null;

    try {
      observer?.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // ignored
    }
    const clsObserver = typeof PerformanceObserver !== "undefined"
      ? new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
            if (!layoutShift.hadRecentInput) {
              clsScore += typeof layoutShift.value === "number" ? layoutShift.value : 0;
            }
          }
        })
      : null;
    try {
      clsObserver?.observe({ type: "layout-shift", buffered: true });
    } catch {
      // ignored
    }

    const inpObserver = typeof PerformanceObserver !== "undefined"
      ? new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const eventEntry = entry as PerformanceEntry & { duration?: number };
            const duration = typeof eventEntry.duration === "number" ? Math.round(eventEntry.duration) : 0;
            if (duration > inpMs) {
              inpMs = duration;
            }
          }
        })
      : null;
    try {
      inpObserver?.observe({ type: "event", buffered: true } as PerformanceObserverInit);
    } catch {
      // ignored
    }

    const flush = () => {
      if (sentRef.current) {
        return;
      }
      sentRef.current = true;
      observer?.disconnect();
      clsObserver?.disconnect();
      inpObserver?.disconnect();

      const metrics: PerfMetricPayload[] = [];
      if (lcpMs > 0) {
        metrics.push({ name: "lcp", value: lcpMs });
      }
      if (loadMs > 0) {
        metrics.push({ name: "load", value: loadMs });
      }
      if (clsScore > 0) {
        metrics.push({ name: "cls", value: Math.round(clsScore * 1000) });
      }
      if (inpMs > 0) {
        metrics.push({ name: "inp", value: inpMs });
      }
      if (metrics.length === 0) {
        return;
      }

      const body = JSON.stringify({
        hotelId,
        slug,
        urlPath: window.location.pathname,
        metrics,
      });

      if (typeof navigator.sendBeacon === "function") {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/perf/public", blob);
        return;
      }

      void fetch("/api/perf/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    };

    const timer = window.setTimeout(flush, 1200);
    const onHidden = () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    };

    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", flush);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", flush);
      observer?.disconnect();
      clsObserver?.disconnect();
      inpObserver?.disconnect();
    };
  }, [hotelId, slug]);

  return null;
}
