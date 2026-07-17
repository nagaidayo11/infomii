"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import {
  getDashboardBootstrapData,
  getCurrentHotelSubscription,
  getCurrentHotelViewMetrics,
  getQrScansLast7Days,
  type HotelViewMetrics,
  type QrScanDayBucket,
  type SubscriptionPlan,
} from "@/lib/storage";
import { ACCESS_REVOKED_MESSAGE, isAccessRevokedError } from "@/lib/access-revoked";
import type { Information } from "@/types/information";
import { useRouteProgressLoading } from "@/components/app/RouteProgressContext";
import { QrCharts } from "./QrCharts";
import { QrPageRow } from "./QrPageRow";
import { PageHelp } from "@/components/help/PageHelp";
import { PAGE_HELP } from "@/lib/page-help-content";

export function QrManagementPanel() {
  const [informations, setInformations] = useState<Information[]>([]);
  const [metrics, setMetrics] = useState<HotelViewMetrics | null>(null);
  const [daily, setDaily] = useState<QrScanDayBucket[]>([]);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useRouteProgressLoading(loading);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getDashboardBootstrapData(),
      getCurrentHotelViewMetrics(),
      getQrScansLast7Days(),
      getCurrentHotelSubscription(),
    ])
      .then(([boot, m, d, sub]) => {
        if (!mounted) return;
        setInformations(boot.informations);
        setMetrics(m);
        setDaily(d);
        setPlan(sub?.plan ?? "free");
      })
      .catch((e) => {
        if (!mounted) return;
        if (isAccessRevokedError(e)) {
          setError(ACCESS_REVOKED_MESSAGE);
          return;
        }
        setError(e instanceof Error ? e.message : "読み込みに失敗しました");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const pageStatsMap = new Map(
    (metrics?.pageStats ?? []).map((p) => [p.informationId, p]),
  );
  const topQrPage = (metrics?.pageStats ?? [])
    .filter((p) => p.qrViews > 0)
    .sort((a, b) => b.qrViews - a.qrViews)[0];

  return (
    <AuthGate>
      <div className="app-main-container space-y-6 sm:space-y-8">
        <header className="app-page-header flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="app-page-title">QR管理</h1>
            <p className="app-page-subtitle">
              ゲストページ用QRの発行・印刷とスキャン分析
            </p>
          </div>
          <PageHelp
            className="shrink-0 self-start sm:self-auto"
            title={PAGE_HELP.qr.title}
            description={PAGE_HELP.qr.description}
            items={[...PAGE_HELP.qr.items]}
          />
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/qr-generator"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            QR作成・印刷
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← ダッシュボード
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-32 animate-pulse rounded-lg bg-slate-200" />
          </div>
        ) : (
          <>
            <QrCharts
              daily={daily}
              qrScans7d={metrics?.qrViews7d ?? 0}
              mostViewedTitle={topQrPage?.title ?? null}
              mostViewedQrCount={topQrPage?.qrViews ?? 0}
            />

            <section>
              <h2 className="text-lg font-semibold text-slate-900">
                ページ別QR
              </h2>
                <p className="mt-1 text-sm text-slate-500">
                  表示・PNG保存・A4印刷・URLコピー
                </p>
                <div className="mt-4 space-y-4">
                  {informations.length === 0 && (
                    <p className="rounded-lg border border-dashed border-[#e6e8eb] bg-white py-12 text-center text-sm text-slate-500">
                      ページがありません。ダッシュボードから作成してください。
                    </p>
                  )}
                  {informations.map((info) => {
                    const stat = pageStatsMap.get(info.id);
                    return (
                      <QrPageRow
                        key={info.id}
                        title={stat?.title || info.title}
                        slug={info.slug}
                        qrScans7d={stat?.qrViews ?? 0}
                        plan={plan}
                      />
                    );
                  })}
                </div>
              </section>
            </>
          )}
      </div>
    </AuthGate>
  );
}
