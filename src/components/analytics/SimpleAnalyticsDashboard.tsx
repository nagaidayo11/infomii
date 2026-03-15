"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import {
  getCurrentHotelViewMetrics,
  getQrScansLast7Days,
  type HotelViewMetrics,
  type QrScanDayBucket,
} from "@/lib/storage";

function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(d);
}

/**
 * シンプル分析ダッシュボード（日本語UI）
 * 今週QRスキャン・ページ閲覧数・人気ページランキング
 */
export function SimpleAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<HotelViewMetrics | null>(null);
  const [dailyQr, setDailyQr] = useState<QrScanDayBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getCurrentHotelViewMetrics(), getQrScansLast7Days()])
      .then(([m, d]) => {
        if (!mounted) return;
        setMetrics(m);
        setDailyQr(d);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "読み込みに失敗しました");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const qrWeek = metrics?.qrViews7d ?? 0;
  const viewsWeek = metrics?.totalViews7d ?? 0;
  const ranking = [...(metrics?.pageStats ?? [])]
    .filter((p) => p.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);
  const maxDaily = Math.max(1, ...dailyQr.map((b) => b.count));

  return (
    <AuthGate>
      <div className="min-h-screen bg-ds-bg px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                分析ダッシュボード
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                直近7日のQRスキャンとページ閲覧の概要
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← ダッシュボード
            </Link>
          </header>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* メトリクスカード（3枚） */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-ds-border bg-ds-card p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">今週QRスキャン</p>
              {loading ? (
                <div className="mt-3 h-10 w-20 animate-pulse rounded-lg bg-slate-100" />
              ) : (
                <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                  {qrWeek}
                </p>
              )}
              <p className="mt-1 text-[11px] text-slate-400">QR経由のアクセス（7日）</p>
            </div>
            <div className="rounded-xl border border-ds-border bg-ds-card p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">ページ閲覧数</p>
              {loading ? (
                <div className="mt-3 h-10 w-20 animate-pulse rounded-lg bg-slate-100" />
              ) : (
                <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                  {viewsWeek}
                </p>
              )}
              <p className="mt-1 text-[11px] text-slate-400">全ページ合計（7日）</p>
            </div>
            <div className="rounded-xl border border-ds-border bg-ds-card p-5 shadow-sm">
              <p className="text-xs font-medium text-slate-500">本日の閲覧</p>
              {loading ? (
                <div className="mt-3 h-10 w-20 animate-pulse rounded-lg bg-slate-100" />
              ) : (
                <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                  {metrics?.totalViewsToday ?? 0}
                </p>
              )}
              <p className="mt-1 text-[11px] text-slate-400">当日の合計</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* チャート：7日QR */}
            <div className="rounded-xl border border-ds-border bg-ds-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                QRスキャン推移（7日）
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">日別のQR経由アクセス</p>
              {loading ? (
                <div className="mt-6 h-36 animate-pulse rounded-lg bg-slate-100" />
              ) : (
                <div className="mt-4 flex h-44 items-end justify-between gap-1 px-1">
                  {dailyQr.map((bucket) => {
                    const h = Math.round((bucket.count / maxDaily) * 100);
                    return (
                      <div
                        key={bucket.date}
                        className="flex min-w-0 flex-1 flex-col items-center gap-2"
                      >
                        <span className="text-[10px] font-medium tabular-nums text-slate-600">
                          {bucket.count}
                        </span>
                        <div className="flex w-full flex-1 items-end justify-center">
                          <div
                            className="w-full max-w-[32px] rounded-t-lg bg-blue-500/90"
                            style={{
                              height: `${Math.max(6, h)}%`,
                              minHeight: bucket.count > 0 ? 14 : 4,
                            }}
                            title={`${bucket.date}: ${bucket.count}`}
                          />
                        </div>
                        <span className="truncate text-[10px] text-slate-400">
                          {formatDayLabel(bucket.date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* チャート：閲覧の内訳（QR vs その他） */}
            <div className="rounded-xl border border-ds-border bg-ds-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                閲覧の内訳（7日）
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">QR経由とその他の比率</p>
              {loading ? (
                <div className="mt-6 h-36 animate-pulse rounded-lg bg-slate-100" />
              ) : viewsWeek > 0 ? (
                <>
                  <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bg-blue-500 transition-all"
                      style={{
                        width: `${Math.round((qrWeek / viewsWeek) * 100)}%`,
                      }}
                      title={`QR ${qrWeek}`}
                    />
                    <div
                      className="bg-slate-300"
                      style={{
                        width: `${100 - Math.round((qrWeek / viewsWeek) * 100)}%`,
                      }}
                      title={`その他 ${viewsWeek - qrWeek}`}
                    />
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-slate-600">
                    <span>QR経由 {qrWeek}</span>
                    <span>その他 {viewsWeek - qrWeek}</span>
                  </div>
                </>
              ) : (
                <p className="mt-8 text-center text-sm text-slate-500">
                  まだ閲覧データがありません
                </p>
              )}
            </div>
          </div>

          {/* 人気ページランキング */}
          <div className="rounded-xl border border-ds-border bg-ds-card shadow-sm">
            <div className="border-b border-ds-border px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                人気ページランキング
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                閲覧数が多い順（7日）
              </p>
            </div>
            {loading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : ranking.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                ランキングできるデータがありません
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {ranking.map((page, index) => (
                  <li
                    key={page.informationId}
                    className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-slate-50/80"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                        {index + 1}
                      </span>
                      <span className="truncate font-medium text-slate-900">
                        {page.title}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 text-xs tabular-nums text-slate-600">
                      <span>閲覧 {page.views}</span>
                      <span className="text-blue-600">QR {page.qrViews}</span>
                      <Link
                        href={`/editor/${page.informationId}`}
                        className="rounded-lg border border-ds-border bg-white px-2 py-1 font-medium hover:bg-slate-50"
                      >
                        編集
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-center text-xs text-slate-400">
            <Link href="/dashboard/analytics/page-views" className="hover:text-slate-600">
              QR分析（ページビュー）
            </Link>
            {" · "}
            <Link href="/dashboard/qr" className="hover:text-slate-600">
              QR管理へ
            </Link>
          </p>
        </div>
      </div>
    </AuthGate>
  );
}
