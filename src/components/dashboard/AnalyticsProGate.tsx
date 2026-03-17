"use client";

import Link from "next/link";
import { createStripeCheckoutSession, trackUpgradeClick } from "@/lib/storage";
import { Button } from "@/components/ui";
import { useState } from "react";

type Plan = "free" | "pro" | "business";

type AnalyticsProGateProps = {
  plan: Plan;
  children: React.ReactNode;
};

/**
 * 分析ダッシュボード用ゲート。Pro/Business のみフル表示、Free はアップグレード案内。
 */
export function AnalyticsProGate({ plan, children }: AnalyticsProGateProps) {
  if (plan === "pro" || plan === "business") {
    return <>{children}</>;
  }

  return (
    <AnalyticsUpgradePrompt />
  );
}

function AnalyticsUpgradePrompt() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await trackUpgradeClick("dashboard-pro");
      const url = await createStripeCheckoutSession({
        plan: "pro",
        successPath: "/dashboard/analytics?billing=success",
        cancelPath: "/dashboard/analytics",
      });
      window.location.href = url;
    } catch (e) {
      setLoading(false);
      alert(e instanceof Error ? e.message : "申し込みの開始に失敗しました");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">分析ダッシュボード</h1>
        <p className="mt-1 text-sm text-slate-500">
          閲覧数・流入元・人気ページの分析は Pro プラン以上でご利用いただけます
        </p>
      </header>

      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/80">
            <svg
              className="h-8 w-8 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">分析機能は Pro プラン以上で利用可能</h2>
          <p className="text-sm text-slate-600">
            総閲覧数・日別推移・国別・言語別・人気ページの詳細分析をご利用いただけます。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/lp/saas#pricing"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              料金を見る
            </Link>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="!text-white"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? "処理中…" : "Proを申し込む（¥1,980/月）"}
            </Button>
          </div>
          <p className="pt-2 text-xs text-slate-500">
            <Link href="/dashboard" className="font-medium text-slate-600 hover:text-slate-900">
              ← ダッシュボードに戻る
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
