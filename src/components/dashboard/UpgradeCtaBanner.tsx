"use client";

import { useState } from "react";
import Link from "next/link";
import { createStripeCheckoutSession, trackUpgradeClick } from "@/lib/storage";
import { Button } from "@/components/ui";

type Plan = "free" | "pro" | "business";

type UpgradeCtaBannerProps = {
  currentPlan: Plan;
  publishedCount: number;
  maxPublishedPages: number;
};

/**
 * ダッシュボード用アップグレードCTA。
 * Free: Pro案内 / Pro（上限接近）: Business案内 / Business: 非表示
 */
export function UpgradeCtaBanner({
  currentPlan,
  publishedCount,
  maxPublishedPages,
}: UpgradeCtaBannerProps) {
  if (currentPlan === "business") return null;

  const isFree = currentPlan === "free";
  const isProNearLimit =
    currentPlan === "pro" && maxPublishedPages <= 10 && publishedCount >= Math.max(1, maxPublishedPages - 1);

  if (isFree) {
    return (
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Proプランで10ページまで作成できます
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              無料プランは1ページまで。Proにアップグレードで分析・複数ページ連携が使えます。
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/lp/saas#pricing"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:min-h-0 sm:py-2"
            >
              料金を見る
            </Link>
            <DashboardCheckoutButton plan="pro" className="w-full justify-center sm:w-auto">
              Proを申し込む（¥1,980/月）
            </DashboardCheckoutButton>
          </div>
        </div>
      </div>
    );
  }

  if (isProNearLimit) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              ページ数の上限に近づいています
            </h3>
            <p className="mt-1 text-xs text-amber-800">
              公開中 {publishedCount}/{maxPublishedPages} 件。Businessプランで無制限まで拡張できます。
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/lp/saas#pricing"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2.5 text-center text-sm font-medium text-amber-800 transition hover:bg-amber-50 sm:min-h-0 sm:py-2"
            >
              料金を見る
            </Link>
            <DashboardCheckoutButton plan="business" variant="secondary" className="w-full justify-center sm:w-auto">
              Businessを申し込む（¥4,980/月）
            </DashboardCheckoutButton>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function DashboardCheckoutButton({
  plan,
  variant = "primary",
  className = "",
  children,
}: {
  plan: "pro" | "business";
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await trackUpgradeClick(plan === "business" ? "dashboard-business" : "dashboard-pro");
      const url = await createStripeCheckoutSession({
        plan,
        successPath: "/dashboard?billing=success",
        cancelPath: "/dashboard",
      });
      window.location.href = url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoading(false);
      alert(msg || "申し込みの開始に失敗しました");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className={(plan === "business" ? "" : "!text-white") + " min-h-[44px] sm:min-h-0 " + className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "処理中…" : children}
    </Button>
  );
}
