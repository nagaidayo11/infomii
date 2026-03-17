"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { AnalyticsProGate } from "@/components/dashboard/AnalyticsProGate";
import { getDashboardBootstrapData, getPageViewAnalytics, type PageViewAnalytics } from "@/lib/storage";

function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(d);
}

/**
 * QR分析ダッシュボード（page_views）
 * 総ビュー数、国別・言語別・日別の内訳
 */
export default function PageViewAnalyticsPage() {
  const [bootstrap, setBootstrap] = useState<{ subscription: { plan: string } | null } | null>(null);
  const [data, setData] = useState<PageViewAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getDashboardBootstrapData(), getPageViewAnalytics()])
      .then(([b, d]) => {
        if (!mounted) return;
        setBootstrap(b);
        setData(d);
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

  const maxDay = Math.max(1, ...(data?.byDay?.map((d) => d.count) ?? [0]));
  const plan = (bootstrap?.subscription?.plan ?? "free") as "free" | "pro" | "business";

  return (
    <AuthGate>
      <AnalyticsProGate plan={plan}>
      <div className="min-h-screen bg-ds-bg px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                QR分析（ページビュー）
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                公開ページの閲覧数・国別・言語別・日別（直近30日）
              </p>
            </div>
            <Link
              href="/dashboard/analytics"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← 分析ダッシュボード
            </Link>
          </header>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* 総ビュー数 */}
          <div className="rounded-xl border border-ds-border bg-ds-card p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500">総ビュー数</p>
            {loading ? (
              <div className="mt-3 h-12 w-24 animate-pulse rounded-lg bg-slate-100" />
            ) : (
              <p className="mt-2 text-4xl font-bold tabular-nums text-slate-900">
                {data?.totalViews ?? 0}
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-400">直近30日間のページビュー合計</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* 国別 */}
            <div className="rounded-xl border border-ds-border bg-ds-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">国別ビュー</h2>
              <p className="mt-0.5 text-xs text-slate-500">閲覧者の国（Vercel/CF  geo）</p>
              {loading ? (
                <div className="mt-4 h-48 animate-pulse rounded-lg bg-slate-100" />
              ) : (data?.byCountry?.length ?? 0) > 0 ? (
                <ul className="mt-4 space-y-2">
                  {data!.byCountry.slice(0, 15).map(({ country, count }) => (
                    <li
                      key={country}
                      className="flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-slate-800">
                        {country || "不明"}
                      </span>
                      <span className="tabular-nums text-slate-600">{count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-center text-sm text-slate-500">データがありません</p>
              )}
            </div>

            {/* 言語別 */}
            <div className="rounded-xl border border-ds-border bg-ds-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">言語別ビュー</h2>
              <p className="mt-0.5 text-xs text-slate-500">ブラウザの言語（Accept-Language）</p>
              {loading ? (
                <div className="mt-4 h-48 animate-pulse rounded-lg bg-slate-100" />
              ) : (data?.byLanguage?.length ?? 0) > 0 ? (
                <ul className="mt-4 space-y-2">
                  {data!.byLanguage.slice(0, 15).map(({ language, count }) => (
                    <li
                      key={language}
                      className="flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-slate-800">
                        {language || "不明"}
                      </span>
                      <span className="tabular-nums text-slate-600">{count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-center text-sm text-slate-500">データがありません</p>
              )}
            </div>
          </div>

          {/* 日別 */}
          <div className="rounded-xl border border-ds-border bg-ds-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">日別ビュー</h2>
            <p className="mt-0.5 text-xs text-slate-500">日別のページビュー数（直近30日）</p>
            {loading ? (
              <div className="mt-6 h-44 animate-pulse rounded-lg bg-slate-100" />
            ) : (data?.byDay?.length ?? 0) > 0 ? (
              <div className="mt-4 flex flex-wrap items-end gap-2">
                {data!.byDay.map(({ date, count }) => {
                  const h = maxDay > 0 ? Math.round((count / maxDay) * 100) : 0;
                  return (
                    <div
                      key={date}
                      className="flex min-w-[2rem] flex-1 flex-col items-center gap-1"
                      title={`${date}: ${count}`}
                    >
                      <span className="text-[10px] font-medium tabular-nums text-slate-600">
                        {count}
                      </span>
                      <div className="flex w-full flex-1 items-end justify-center">
                        <div
                          className="w-full max-w-[24px] rounded-t bg-blue-500/90"
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
            ) : (
              <p className="mt-8 text-center text-sm text-slate-500">データがありません</p>
            )}
          </div>

          <p className="text-center text-xs text-slate-400">
            <Link href="/dashboard/analytics" className="hover:text-slate-600">
              分析ダッシュボードへ
            </Link>
          </p>
        </div>
      </div>
      </AnalyticsProGate>
    </AuthGate>
  );
}
