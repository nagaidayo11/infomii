"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getDashboardBootstrapData,
  getCurrentHotelViewMetrics,
  getPageViewAnalytics,
  type HotelViewMetrics,
  type PageViewAnalytics,
} from "@/lib/storage";
import { AnalyticsProGate } from "@/components/dashboard/AnalyticsProGate";
import { AnalyticsSummaryCard } from "./AnalyticsSummaryCard";

function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(d);
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
    <div className="flex items-center gap-3 py-2">
      <span className="w-24 shrink-0 truncate text-sm font-medium text-slate-700" title={label}>
        {label || "—"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="h-6 overflow-hidden rounded-md bg-slate-100">
          <div
            className="h-full rounded-md bg-slate-600 transition-all"
            style={{ width: `${Math.max(4, pct)}%` }}
          />
        </div>
      </div>
      <span className="w-10 shrink-0 text-right text-sm tabular-nums text-slate-600">{count}</span>
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

  const totalViews = pageViews?.totalViews ?? metrics?.totalViews7d ?? 0;
  const todayViews = metrics?.totalViewsToday ?? 0;
  const topPages = [...(metrics?.pageStats ?? [])].sort((a, b) => b.views - a.views).slice(0, 10);
  const byDay = pageViews?.byDay ?? [];
  const byCountry = pageViews?.byCountry ?? [];
  const byLanguage = pageViews?.byLanguage ?? [];
  const maxDay = Math.max(1, ...byDay.map((d) => d.count));
  const maxCountry = Math.max(1, ...byCountry.map((c) => c.count));
  const maxLanguage = Math.max(1, ...byLanguage.map((l) => l.count));

  const plan = (bootstrap?.subscription?.plan ?? "free") as "free" | "pro" | "business";

  return (
    <AnalyticsProGate plan={plan}>
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">分析ダッシュボード</h1>
        <p className="mt-1 text-sm text-slate-500">
          お客様の閲覧状況を確認し、ゲストエンゲージメントを把握できます
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Primary metrics: Total page views, Views today, 7d, QR */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          主要指標
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          日別ビュー
        </h2>
        <p className="mt-1 text-sm text-slate-500">直近30日間の日別閲覧数</p>
        {loading ? (
          <div className="mt-3 h-40 animate-pulse rounded-xl bg-slate-100" />
        ) : byDay.length > 0 ? (
          <div className="mt-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="flex items-end gap-1">
              {byDay.map(({ date, count }) => {
                const h = maxDay > 0 ? Math.round((count / maxDay) * 100) : 0;
                return (
                  <div
                    key={date}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1"
                    title={`${date}: ${count} 回`}
                  >
                    <span className="text-[10px] font-medium tabular-nums text-slate-600">
                      {count}
                    </span>
                    <div className="flex w-full flex-1 items-end justify-center">
                      <div
                        className="w-full max-w-[20px] rounded-t bg-slate-600"
                        style={{
                          height: `${Math.max(6, h)}%`,
                          minHeight: count > 0 ? 10 : 4,
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
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-500">
            まだデータがありません
          </p>
        )}
      </section>

      {/* Views by country & language — simple horizontal bar charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            国別ビュー
          </h2>
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
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            言語別ビュー
          </h2>
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
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          人気ページ
        </h2>
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
                  className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-slate-50/80"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {index + 1}
                    </span>
                    <span className="truncate font-medium text-slate-900">{page.title}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm tabular-nums text-slate-600">
                    <span>{page.views} 回</span>
                    <Link
                      href="/dashboard/pages"
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
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
