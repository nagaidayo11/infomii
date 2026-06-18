"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { triggerAnalyticsCsvDownload } from "@/lib/analytics-csv-export";
import {
  getDashboardBootstrapData,
  getCurrentHotelViewMetrics,
  getPageViewAnalytics,
  type HotelViewMetrics,
  type PageViewAnalytics,
} from "@/lib/storage";
import { AnalyticsProGate } from "@/components/dashboard/AnalyticsProGate";
import { useRouteProgressLoading } from "@/components/app/RouteProgressContext";
import { AnalyticsSummaryCard } from "./AnalyticsSummaryCard";

const DAY_RANGE_OPTIONS = [7, 30, 60, 90] as const;
type DayRange = (typeof DAY_RANGE_OPTIONS)[number];

function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(d);
}

function buildDayBuckets(
  byDay: Array<{ date: string; count: number }>,
  days: DayRange
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

/**
 * Simple horizontal bar for distribution (country / language).
 * maxCount is used to scale bar width; label and count shown.
 */
function SimpleBarRow({
  label,
  count,
  maxCount,
}: {
  label: string;
  count: number;
  maxCount: number;
}) {
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  return (
    <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex min-w-0 items-center justify-between gap-2 sm:w-28 sm:shrink-0 sm:justify-start">
        <span className="truncate text-sm font-medium text-slate-700" title={label}>
          {label || "—"}
        </span>
        <span className="shrink-0 text-sm tabular-nums text-slate-600 sm:hidden">{count}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="h-6 overflow-hidden rounded-md bg-slate-100">
          <div
            className="h-full rounded-md bg-slate-600 transition-all"
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
      </div>
      <span className="hidden w-10 shrink-0 text-right text-sm tabular-nums text-slate-600 sm:inline-block">{count}</span>
    </div>
  );
}

/**
 * Analytics dashboard for hotel operators.
 * Metrics: Total page views, Views today, Views by country, Views by language, Top pages.
 * Simple charts, clear labels, guest engagement at a glance.
 */
export function AnalyticsView() {
  const [bootstrap, setBootstrap] = useState<{ subscription: { plan: string } | null } | null>(null);
  const [metrics, setMetrics] = useState<HotelViewMetrics | null>(null);
  const [pageViews, setPageViews] = useState<PageViewAnalytics | null>(null);
  const [dayRange, setDayRange] = useState<DayRange>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useRouteProgressLoading(loading);

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

  const totalViews = pageViews?.totalViews ?? metrics?.totalViews7d ?? 0;
  const todayViews = metrics?.totalViewsToday ?? 0;
  const topPages = [...(metrics?.pageStats ?? [])].sort((a, b) => b.views - a.views).slice(0, 10);
  const byDay = buildDayBuckets(pageViews?.byDay ?? [], dayRange);
  const byCountry = pageViews?.byCountry ?? [];
  const byLanguage = pageViews?.byLanguage ?? [];
  const maxDay = Math.max(1, ...byDay.map((d) => d.count));
  const hasDayData = byDay.some((d) => d.count > 0);
  const maxCountry = Math.max(1, ...byCountry.map((c) => c.count));
  const maxLanguage = Math.max(1, ...byLanguage.map((l) => l.count));

  const plan = (bootstrap?.subscription?.plan ?? null) as "free" | "pro" | "business" | null;

  if (!loading && error) {
    return (
      <div className="app-main-container space-y-4">
        <header className="app-page-header">
          <h1 className="app-page-title">分析ダッシュボード</h1>
        </header>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
        <p className="text-sm text-slate-600">
          <Link href="/dashboard" className="font-medium text-slate-800 hover:text-slate-900">
            ← ダッシュボードに戻る
          </Link>
        </p>
      </div>
    );
  }

  if (!bootstrap && loading) {
    return (
      <div className="app-main-container space-y-6">
        <header className="app-page-header">
          <h1 className="app-page-title">分析ダッシュボード</h1>
          <p className="app-page-subtitle">データを読み込んでいます</p>
        </header>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-44 animate-pulse rounded-xl bg-slate-100" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-52 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-52 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <AnalyticsProGate plan={plan ?? "free"}>
    <div className="app-main-container space-y-8">
      <header className="app-page-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="app-page-title">分析ダッシュボード</h1>
          <p className="app-page-subtitle">
            お客様の閲覧状況を確認し、ゲストエンゲージメントを把握できます
          </p>
        </div>
        {plan === "business" && !loading && (
          <button
            type="button"
            onClick={() => triggerAnalyticsCsvDownload(metrics, pageViews)}
            className="app-button-native inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-900 shadow-sm transition hover:bg-indigo-100 sm:min-h-0"
          >
            CSVをダウンロード（Business）
          </button>
        )}
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Primary metrics: Total page views, Views today, 7d, QR */}
      <section>
        <h2 className="app-section-title">主要指標</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <AnalyticsSummaryCard
            label="総ページビュー"
            value={loading ? "—" : totalViews}
            sub="直近30日"
          />
          <AnalyticsSummaryCard
            label="本日の閲覧"
            value={loading ? "—" : todayViews}
            sub="今日"
          />
          <AnalyticsSummaryCard
            label="7日間の閲覧"
            value={loading ? "—" : (metrics?.totalViews7d ?? 0)}
            sub="直近7日"
          />
          <AnalyticsSummaryCard
            label="QR経由（7日）"
            value={loading ? "—" : (metrics?.qrViews7d ?? 0)}
            sub="QRコード経由"
          />
        </div>
      </section>

      {/* Views by day — simple bar chart */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="app-section-title">日別ビュー</h2>
            <p className="mt-1 text-sm text-slate-500">直近{dayRange}日間の日別閲覧数</p>
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            {DAY_RANGE_OPTIONS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setDayRange(days)}
                className={`app-button-native min-h-[36px] rounded-md px-2.5 text-xs font-semibold sm:px-3 ${
                  dayRange === days
                    ? "bg-emerald-600 !text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                aria-pressed={dayRange === days}
              >
                {days}日
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="mt-3 h-40 animate-pulse rounded-xl bg-slate-100" />
        ) : hasDayData ? (
          <div className="mt-3 rounded-xl border border-slate-200/90 bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:p-4">
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div className={`flex h-40 items-end ${dayRange <= 14 ? "justify-between gap-1" : "gap-1.5"}`}>
              {byDay.map(({ date, count }) => {
                const h = maxDay > 0 ? Math.round((count / maxDay) * 100) : 0;
                return (
                  <div
                    key={date}
                    className={`flex flex-col items-center gap-2 ${
                      dayRange <= 14
                        ? "min-w-0 flex-1"
                        : "w-8 min-w-[2rem] shrink-0"
                    }`}
                    title={`${date}: ${count} 回`}
                  >
                    <span className="text-[10px] font-medium tabular-nums text-slate-600">
                      {count}
                    </span>
                    <div className="flex w-full flex-1 items-end justify-center">
                      <div
                        className="w-full max-w-[28px] rounded-t-md bg-emerald-500 transition-all"
                        style={{
                          height: `${Math.max(8, h)}%`,
                          minHeight: count > 0 ? 12 : 4,
                        }}
                      />
                    </div>
                    <span className="truncate text-[10px] text-slate-400">
                      {formatDayLabel(date)}
                    </span>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-500">
            まだデータがありません
          </p>
        )}
      </section>

      {/* Views by country & language — simple horizontal bar charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="app-section-title">国別ビュー</h2>
          <p className="mt-1 text-sm text-slate-500">アクセス元の国・地域</p>
          {loading ? (
            <div className="mt-3 h-48 animate-pulse rounded-xl bg-slate-100" />
          ) : byCountry.length > 0 ? (
            <div className="mt-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              {byCountry.slice(0, 10).map(({ country, count }) => (
                <SimpleBarRow
                  key={country}
                  label={country || "不明"}
                  count={count}
                  maxCount={maxCountry}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-500">
              データがありません
            </p>
          )}
        </section>

        <section>
          <h2 className="app-section-title">言語別ビュー</h2>
          <p className="mt-1 text-sm text-slate-500">ブラウザの言語設定</p>
          {loading ? (
            <div className="mt-3 h-48 animate-pulse rounded-xl bg-slate-100" />
          ) : byLanguage.length > 0 ? (
            <div className="mt-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              {byLanguage.slice(0, 10).map(({ language, count }) => (
                <SimpleBarRow
                  key={language}
                  label={language || "不明"}
                  count={count}
                  maxCount={maxLanguage}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-500">
              データがありません
            </p>
          )}
        </section>
      </div>

      {/* Top pages */}
      <section>
        <h2 className="app-section-title">人気ページ</h2>
        <p className="mt-1 text-sm text-slate-500">閲覧数が多いページ（直近7日）</p>
        {loading ? (
          <div className="mt-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : topPages.length > 0 ? (
          <div className="mt-3 rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <ul className="divide-y divide-slate-100">
              {topPages.map((page, index) => (
                <li
                  key={page.informationId}
                  className="flex flex-col gap-3 px-4 py-3 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium text-slate-900">{page.title}</span>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-sm tabular-nums text-slate-600 sm:justify-end sm:gap-3">
                    <span>{page.views} 回</span>
                    <Link
                      href="/dashboard/pages"
                      className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:min-h-0 sm:px-2.5 sm:py-1.5"
                    >
                      ページ一覧
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-500">
            まだデータがありません
          </p>
        )}
      </section>
    </div>
    </AnalyticsProGate>
  );
}
