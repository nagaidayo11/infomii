"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/app";
import { PlanUsageStrip } from "@/components/dashboard/PlanUsageStrip";
import { DashboardSetupChecklist } from "@/components/dashboard/DashboardSetupChecklist";
import { DashboardHomeStarters } from "@/components/dashboard/DashboardHomeStarters";
import { DashboardContinueCard } from "@/components/dashboard/DashboardContinueCard";
import { AnalyticsSummaryCard } from "@/components/saas/AnalyticsSummaryCard";
import { SETUP_CHECKLIST_DISMISS_KEY } from "@/lib/dashboard-setup";

type DemoState = "empty" | "draft" | "partial";

function resolveState(raw: string | null): DemoState {
  if (raw === "draft" || raw === "partial") return raw;
  return "empty";
}

/**
 * Public preview of first-run dashboard onboarding (same components as /dashboard).
 * `/demo/dashboard-onboarding?state=empty|draft|partial`
 */
export default function DemoDashboardOnboardingPage() {
  const searchParams = useSearchParams();
  const state = resolveState(searchParams.get("state"));

  useEffect(() => {
    try {
      window.localStorage.removeItem(SETUP_CHECKLIST_DISMISS_KEY);
    } catch {
      /* ignore */
    }
  }, [state]);

  const hotelName = state === "empty" ? "nagai Store" : "Infomii デモホテル";
  const pageCount = state === "empty" ? 0 : 1;
  const publishedCount = state === "partial" ? 1 : 0;
  const qrViews7d = state === "partial" ? 12 : 0;

  return (
    <AppLayout>
      <div className="app-main-container space-y-6" data-demo-onboarding={state}>
        <header className="app-page-header">
          <p className="text-xs font-medium text-amber-700">デモ — 初回オンボーディング UI（`state={state}`）</p>
          <h1 className="app-page-title">ダッシュボード</h1>
          <p className="app-page-subtitle">案内ページの作成・公開・QR運用をここから進めます</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link href="/demo/dashboard-onboarding?state=empty" className="app-button-native rounded-md bg-slate-900 px-2.5 py-1 !text-white hover:!text-white">
              0ページ
            </Link>
            <Link
              href="/demo/dashboard-onboarding?state=draft"
              className="rounded-md border border-[#e6e8eb] bg-white px-2.5 py-1 text-slate-700"
            >
              下書き1件
            </Link>
            <Link
              href="/demo/dashboard-onboarding?state=partial"
              className="rounded-md border border-[#e6e8eb] bg-white px-2.5 py-1 text-slate-700"
            >
              公開済み
            </Link>
          </div>
        </header>

        <PlanUsageStrip plan="free" publishedCount={publishedCount} maxPublishedPages={2} />

        <DashboardSetupChecklist
          hotelName={hotelName}
          pageCount={pageCount}
          publishedCount={publishedCount}
          qrViews7d={qrViews7d}
          canEdit
        />

        {state === "empty" ? <DashboardHomeStarters /> : null}

        {state === "draft" ? (
          <DashboardContinueCard
            pageId="demo-page"
            title="館内案内（下書き）"
            status="draft"
            updatedAt={new Date(Date.now() - 1000 * 60 * 18).toISOString()}
          />
        ) : null}

        {state === "partial" ? (
          <DashboardContinueCard
            pageId="demo-page"
            title="館内案内"
            status="published"
            updatedAt={new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()}
          />
        ) : null}

        <section>
          <h2 className="app-section-title">概要</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsSummaryCard label="閲覧（7日）" value={state === "partial" ? 48 : 0} />
            <AnalyticsSummaryCard label="本日" value={state === "partial" ? 6 : 0} />
            <AnalyticsSummaryCard label="公開中" value={publishedCount} sub="上限 2" />
            <AnalyticsSummaryCard label="下書き" value={Math.max(0, pageCount - publishedCount)} />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
