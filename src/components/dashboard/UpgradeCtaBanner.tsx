"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { purchaseAppleSubscription } from "@/lib/apple-iap-client";
import { APP_BILLING_PATH } from "@/lib/app-billing-nav";
import { shouldUseAppleIapBilling } from "@/lib/app-store-compliance";
import { isNativeIapAvailable } from "@/lib/native-iap";
import { createStripeCheckoutSession, getCurrentUserHotelRole, trackUpgradeClick } from "@/lib/storage";
import { useClientShell } from "@/components/app-shell/useClientShell";
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
  const { isAppShell } = useClientShell();
  const useAppStore = isAppShell || (shouldUseAppleIapBilling() && isNativeIapAvailable());

  if (currentPlan === "business") return null;

  const isFree = currentPlan === "free";
  const isProNearLimit =
    currentPlan === "pro" && maxPublishedPages <= 10 && publishedCount >= Math.max(1, maxPublishedPages - 1);

  const pricingHref = useAppStore ? APP_BILLING_PATH : "/lp/business#pricing";
  const pricingLabel = useAppStore ? "プランを見る" : "料金を見る";

  if (isFree) {
    return (
      <div className="rounded-lg border border-[#e6e8eb] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Proプランで10ページまで作成できます
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              無料プランは3ページまで。Proで分析・複数ページ連携が使えます。
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={pricingHref}
              className="app-button-native inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#e6e8eb] bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 sm:min-h-0"
            >
              {pricingLabel}
            </Link>
            <DashboardCheckoutButton
              plan="pro"
              useAppStore={useAppStore}
              variant="secondary"
              className="w-full justify-center !rounded-md !border-slate-900 !bg-slate-900 !px-3 !py-2 !text-sm !font-medium !text-white hover:!border-slate-800 hover:!bg-slate-800 sm:w-auto"
            >
              Proを申し込む（¥1,280/月）
            </DashboardCheckoutButton>
          </div>
        </div>
      </div>
    );
  }

  if (isProNearLimit) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              href={pricingHref}
              className="app-button-native inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#e6e8eb] bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 sm:min-h-0"
            >
              {pricingLabel}
            </Link>
            <DashboardCheckoutButton plan="business" useAppStore={useAppStore} variant="secondary" className="w-full justify-center !rounded-md sm:w-auto">
              Businessプランを申し込む（¥3,480/月）
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
  useAppStore,
  variant = "primary",
  className = "",
  children,
}: {
  plan: "pro" | "business";
  useAppStore: boolean;
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
}) {
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

  const handleClick = async () => {
    if (loading) return;
    if (!canManageBilling) {
      setMessage("課金操作はオーナーのみ可能です。オーナーに依頼してください。");
      return;
    }
    setMessage(null);
    setLoading(true);
    try {
      await trackUpgradeClick(plan === "business" ? "dashboard-business" : "dashboard-pro");
      if (useAppStore) {
        await purchaseAppleSubscription(plan, "monthly");
        window.location.assign(`${APP_BILLING_PATH}?billing=success`);
        return;
      }
      const url = await createStripeCheckoutSession({
        plan,
        successPath: "/dashboard?billing=success",
        cancelPath: "/dashboard",
      });
      window.location.href = url;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLoading(false);
      if (!msg.includes("キャンセル")) {
        setMessage(msg || "申し込みの開始に失敗しました");
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant={variant}
        size="sm"
        className={(variant === "primary" ? "!text-white " : "") + "min-h-[44px] sm:min-h-0 " + className}
        onClick={handleClick}
        disabled={loading || !canManageBilling}
      >
        {loading ? "処理中…" : children}
      </Button>
      {!canManageBilling ? (
        <p className="text-xs text-slate-500">課金操作はオーナーのみ可能です。オーナーに依頼してください。</p>
      ) : null}
      {message ? <p className="text-xs text-rose-600">{message}</p> : null}
    </div>
  );
}
