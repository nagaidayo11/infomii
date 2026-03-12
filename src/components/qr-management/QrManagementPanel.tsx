"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import {
  getDashboardBootstrapData,
  getCurrentHotelViewMetrics,
  getQrScansLast7Days,
  type HotelViewMetrics,
  type QrScanDayBucket,
} from "@/lib/storage";
import type { Information } from "@/types/information";
import { QrCharts } from "./QrCharts";
import { QrPageRow } from "./QrPageRow";

export function QrManagementPanel() {
  const [informations, setInformations] = useState<Information[]>([]);
  const [metrics, setMetrics] = useState<HotelViewMetrics | null>(null);
  const [daily, setDaily] = useState<QrScanDayBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getDashboardBootstrapData(),
      getCurrentHotelViewMetrics(),
      getQrScansLast7Days(),
    ])
      .then(([boot, m, d]) => {
        if (!mounted) return;
        setInformations(boot.informations);
        setMetrics(m);
        setDaily(d);
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

  const pageStatsMap = new Map(
    (metrics?.pageStats ?? []).map((p) => [p.informationId, p]),
  );
  const topQrPage = (metrics?.pageStats ?? [])
    .filter((p) => p.qrViews > 0)
    .sort((a, b) => b.qrViews - a.qrViews)[0];

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                QR管理
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                ゲストページ用QRの発行・印刷とスキャン分析
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← ダッシュボード
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
            </div>
          ) : (
            <>
              <QrCharts
                daily={daily}
                qrScans7d={metrics?.qrViews7d ?? 0}
                mostViewedTitle={topQrPage?.title ?? null}
                mostViewedQrCount={topQrPage?.qrViews ?? 0}
              />

              <section className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900">
                  ページ別QR
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  表示・PNG保存・A4印刷・URLコピー
                </p>
                <div className="mt-4 space-y-4">
                  {informations.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
                      ページがありません。ダッシュボードから作成してください。
                    </p>
                  )}
                  {informations.map((info) => {
                    const stat = pageStatsMap.get(info.id);
                    return (
                      <QrPageRow
                        key={info.id}
                        title={info.title}
                        slug={info.slug}
                        qrScans7d={stat?.qrViews ?? 0}
                      />
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
