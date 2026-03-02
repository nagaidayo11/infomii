"use client";

import { useEffect, useRef } from "react";

type PublicPerformanceTrackerProps = {
  hotelId: string | null;
  slug: string;
};

type PerfMetricPayload = {
  name: "lcp" | "load";
  value: number;
};

export function PublicPerformanceTracker({ hotelId, slug }: PublicPerformanceTrackerProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!hotelId || sentRef.current) {
      return;
    }

    let lcpMs = 0;
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

    const flush = () => {
      if (sentRef.current) {
        return;
      }
      sentRef.current = true;
      observer?.disconnect();

      const metrics: PerfMetricPayload[] = [];
      if (lcpMs > 0) {
        metrics.push({ name: "lcp", value: lcpMs });
      }
      if (loadMs > 0) {
        metrics.push({ name: "load", value: loadMs });
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
    };
  }, [hotelId, slug]);

  return null;
}
