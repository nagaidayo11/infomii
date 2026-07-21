"use client";

import { useEffect, useState } from "react";
import {
  getDashboardBootstrapData,
  getCurrentHotelViewMetrics,
  getPageViewAnalytics,
  type HotelViewMetrics,
  type PageViewAnalytics,
} from "@/lib/storage";

export const ANALYTICS_DAY_RANGE_OPTIONS = [7, 30, 60, 90] as const;
export type AnalyticsDayRange = (typeof ANALYTICS_DAY_RANGE_OPTIONS)[number];

export function buildAnalyticsDayBuckets(
  byDay: Array<{ date: string; count: number }>,
  days: AnalyticsDayRange,
): Array<{ date: string; count: number }> {
  const countByDate = new Map(byDay.map((row) => [row.date, row.count] as const));
  const now = new Date();
  const buckets: Array<{ date: string; count: number }> = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    buckets.push({ date, count: countByDate.get(date) ?? 0 });
  }
  return buckets;
}

export function formatAnalyticsDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(d);
}

export function useAnalyticsDashboard() {
  const [bootstrap, setBootstrap] = useState<{ subscription: { plan: string } | null } | null>(null);
  const [metrics, setMetrics] = useState<HotelViewMetrics | null>(null);
  const [pageViews, setPageViews] = useState<PageViewAnalytics | null>(null);
  const [dayRange, setDayRange] = useState<AnalyticsDayRange>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getDashboardBootstrapData(),
      getCurrentHotelViewMetrics().catch(() => null),
      getPageViewAnalytics().catch(() => null),
    ])
      .then(([b, m, p]) => {
        if (!mounted) return;
        setBootstrap(b);
        setMetrics(m ?? null);
        setPageViews(p ?? null);
      })
      .catch((e) => {
        if (mounted) setError(e instanceof Error ? e.message : "読み込みに失敗しました");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const plan = (bootstrap?.subscription?.plan ?? null) as "free" | "pro" | "business" | null;
  const totalViews = pageViews?.totalViews ?? metrics?.totalViews7d ?? 0;
  const todayViews = metrics?.totalViewsToday ?? 0;
  const topPages = [...(metrics?.pageStats ?? [])].sort((a, b) => b.views - a.views).slice(0, 10);
  const byDay = buildAnalyticsDayBuckets(pageViews?.byDay ?? [], dayRange);
  const byCountry = pageViews?.byCountry ?? [];
  const byLanguage = pageViews?.byLanguage ?? [];
  const maxDay = Math.max(1, ...byDay.map((d) => d.count));
  const hasDayData = byDay.some((d) => d.count > 0);
  const maxCountry = Math.max(1, ...byCountry.map((c) => c.count));
  const maxLanguage = Math.max(1, ...byLanguage.map((l) => l.count));

  return {
    bootstrap,
    metrics,
    pageViews,
    dayRange,
    setDayRange,
    loading,
    error,
    plan,
    totalViews,
    todayViews,
    topPages,
    byDay,
    byCountry,
    byLanguage,
    maxDay,
    hasDayData,
    maxCountry,
    maxLanguage,
  };
}
