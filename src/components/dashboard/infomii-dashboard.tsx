"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import {
  getDashboardBootstrapData,
  getCurrentHotelViewMetrics,
  type HotelViewMetrics,
} from "@/lib/storage";
import type { Information } from "@/types/information";
import { DashboardStatsCards } from "./dashboard-stats-cards";
import { DashboardPageTable } from "./dashboard-page-table";

/**
 * インフォミー向けモダンSaaSダッシュボード
 * 日本語UIのみ。統計3枚 + ページ一覧テーブル。
 */
export function InfomiiDashboard() {
  const [items, setItems] = useState<Information[]>([]);
  const [metrics, setMetrics] = useState<HotelViewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getDashboardBootstrapData(), getCurrentHotelViewMetrics()])
      .then(([boot, m]) => {
        if (!mounted) return;
        setItems(boot.informations);
        setMetrics(m);
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

  const publishedCount = items.filter((i) => i.status === "published").length;
  const pageStatsMap = new Map(
    (metrics?.pageStats ?? []).map((p) => [p.informationId, p])
  );

  return (
    <AuthGate>
      <div className="min-h-screen bg-ds-bg px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                ダッシュボード
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                インフォミー — 館内案内ページの状況
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard"
                className="rounded-lg border border-ds-border bg-ds-card px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                詳細ダッシュボード
              </Link>
              <Link
                href="/dashboard/qr"
                className="rounded-lg border border-ds-border bg-ds-card px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                QR管理
              </Link>
            </div>
          </header>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <DashboardStatsCards
            qrScansWeek={metrics?.qrViews7d ?? 0}
            publishedCount={publishedCount}
            viewsToday={metrics?.totalViewsToday ?? 0}
            loading={loading}
          />

          <DashboardPageTable
            loading={loading}
            rows={items.map((item) => {
              const stat = pageStatsMap.get(item.id);
              return {
                id: item.id,
                title: item.title,
                slug: item.slug,
                views7d: stat?.views ?? 0,
                status: item.status,
              };
            })}
          />
        </div>
      </div>
    </AuthGate>
  );
}
