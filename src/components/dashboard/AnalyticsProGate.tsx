"use client";

import Link from "next/link";
import { purchaseAppleSubscription } from "@/lib/apple-iap-client";
import { shouldUseAppleIapBilling } from "@/lib/app-store-compliance";
import { APP_BILLING_PATH } from "@/lib/app-billing-nav";
import { isNativeIapAvailable } from "@/lib/native-iap";
import { createStripeCheckoutSession, getCurrentUserHotelRole, trackUpgradeClick } from "@/lib/storage";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { Button } from "@/components/ui";
import { useEffect, useState } from "react";

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
  const { isAppShell } = useClientShell();
  const useAppStore = isAppShell || (shouldUseAppleIapBilling() && isNativeIapAvailable());
  const [loading, setLoading] = useState(false);
  const [canManageBilling, setCanManageBilling] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void getCurrentUserHotelRole()
      .then((role) => {
        if (!mounted) return;
        if (role === "admin" || role === "editor" || role === "viewer") {
          setCanManageBilling(false);
        } else {
          setCanManageBilling(true);
        }
      })
      .catch(() => {
        if (mounted) setCanManageBilling(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpgrade = async () => {
    if (loading) return;
    if (!canManageBilling) {
      setMessage("課金操作はオーナーのみ可能です。オーナーに依頼してください。");
      return;
    }
    setMessage(null);
    setLoading(true);
    try {
      await trackUpgradeClick("dashboard-pro");
      if (useAppStore) {
        await purchaseAppleSubscription("pro", "monthly");
        window.location.assign("/dashboard/analytics?billing=success");
        return;
      }
      const url = await createStripeCheckoutSession({
        plan: "pro",
        successPath: "/dashboard/analytics?billing=success",
        cancelPath: "/dashboard/analytics",
      });
      window.location.href = url;
    } catch (e) {
      setLoading(false);
      setMessage(e instanceof Error ? e.message : "申し込みの開始に失敗しました");
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
          <div className="flex flex-col items-stretch justify-center gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
            {useAppStore ? (
              <Link
                href={APP_BILLING_PATH}
                className="app-button-native inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 sm:min-h-0"
              >
                プランを見る
              </Link>
            ) : (
              <Link
                href="/lp/saas#pricing-plans"
                className="app-button-native inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50 sm:min-h-0"
              >
                料金を見る
              </Link>
            )}
            <Button
              type="button"
              variant="primary"
              size="md"
              className="min-h-[44px] w-full !border-slate-800/30 !bg-slate-900 !font-semibold !text-white hover:!bg-slate-800 hover:!shadow-ds-md sm:min-h-0 sm:w-auto"
              onClick={handleUpgrade}
              disabled={loading || !canManageBilling}
            >
              {loading ? "処理中…" : useAppStore ? "Proを申し込む" : "プランをアップグレードする"}
            </Button>
          </div>
          {!canManageBilling ? (
            <p className="text-xs text-slate-500">課金操作はオーナーのみ可能です。オーナーに依頼してください。</p>
          ) : null}
          {message ? <p className="text-xs text-rose-600">{message}</p> : null}
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
