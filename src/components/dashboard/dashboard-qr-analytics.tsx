"use client";

import Link from "next/link";
import { DashboardCard, DashboardCardHeader, DashboardStatTile } from "./dashboard-card";
import type { HotelViewMetrics } from "@/lib/storage";

type DashboardQrAnalyticsProps = {
  metrics: HotelViewMetrics | null;
  loading?: boolean;
};

/**
 * QR / view analytics: total scans, popular pages, 7-day summary.
 */
export function DashboardQrAnalytics({
  metrics,
  loading,
}: DashboardQrAnalyticsProps) {
  const totalScans7d = metrics?.qrViews7d ?? 0;
  const totalViews7d = metrics?.totalViews7d ?? 0;
  const popular = metrics?.topPages ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DashboardCard>
        <DashboardCardHeader
          title="QR アナリティクス"
          description="直近7日のスキャンと閲覧"
        />
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <DashboardStatTile
                label="QRスキャン合計（7日）"
                value={totalScans7d}
                sub={`全閲覧 ${totalViews7d} 件のうち QR 経由`}
              />
              <DashboardStatTile
                label="本日のQR"
                value={metrics?.qrViewsToday ?? 0}
                sub={`本日の全閲覧 ${metrics?.totalViewsToday ?? 0} 件`}
              />
            </div>
            {/* Simple 7d activity bar: QR share of total */}
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500">
                7日間の内訳
              </p>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-100">
                {totalViews7d > 0 ? (
                  <>
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{
                        width: `${Math.round((totalScans7d / totalViews7d) * 100)}%`,
                      }}
                      title={`QR ${totalScans7d}`}
                    />
                    <div
                      className="bg-slate-300"
                      style={{
                        width: `${100 - Math.round((totalScans7d / totalViews7d) * 100)}%`,
                      }}
                      title={`その他 ${totalViews7d - totalScans7d}`}
                    />
                  </>
                ) : (
                  <div className="w-full bg-slate-100" />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                緑 = QR経由 / 灰 = その他
              </p>
            </div>
          </>
        )}
      </DashboardCard>

      <DashboardCard>
        <DashboardCardHeader
          title="人気ページ"
          description="閲覧数が多い順（7日）"
        />
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        ) : popular.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
            まだ閲覧データがありません
          </p>
        ) : (
          <ul className="space-y-2">
            {popular.map((page, index) => (
              <li
                key={page.informationId}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {index + 1}
                  </span>
                  <span className="truncate font-medium text-slate-800">
                    {page.title}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
                  <span className="tabular-nums">{page.views} 回</span>
                  <span className="tabular-nums text-emerald-600">
                    QR {page.qrViews}
                  </span>
                  <Link
                    href={`/editor/page/${page.informationId}`}
                    className="rounded-md border border-slate-200 px-2 py-1 font-medium text-slate-700 hover:bg-white"
                  >
                    編集
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}
