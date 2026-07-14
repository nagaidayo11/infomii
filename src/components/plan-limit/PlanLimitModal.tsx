"use client";

import Link from "next/link";
import { APP_BILLING_PATH } from "@/lib/app-billing-nav";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { PLAN_PAGE_LIMITS } from "@/lib/plan-limits";

type PlanLimitModalProps = {
  open: boolean;
  onClose: () => void;
  message?: string;
  /** 現在のプラン。Pro の場合は Business のみ案内。 */
  currentPlan?: "free" | "pro" | "business";
};

const pricingHref = "/lp/saas#pricing-plans";

/**
 * ページ数上限到達時に表示するモーダル。Pro/Business プランへのアップグレードを促す。
 */
export function PlanLimitModal({ open, onClose, message, currentPlan = "free" }: PlanLimitModalProps) {
  const { isAppShell } = useClientShell();
  if (!open) return null;

  const isPro = currentPlan === "pro";
  const upgradeHref = isAppShell ? APP_BILLING_PATH : pricingHref;
  const defaultMessage = isPro
    ? `Proプランでは${PLAN_PAGE_LIMITS.pro}ページまでです。Businessプランにアップグレードすると無制限で作成できます。`
    : `無料プランでは${PLAN_PAGE_LIMITS.free}ページまで作成できます。Proプランで${PLAN_PAGE_LIMITS.pro}ページ、Businessプランで無制限まで拡張できます。`;

  return (
    <div
      className="ui-overlay-fade fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-limit-title"
    >
      <div
        className="ui-pop-in w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="plan-limit-title" className="text-lg font-semibold text-slate-900">
          ページ数の上限に達しました
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {message ?? defaultMessage}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {!isPro && (
            <Link
              href={upgradeHref}
              className="app-button-native inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800"
            >
              {isAppShell ? "Proプランを申し込む" : "Proプラン（¥1,280/月）"}
            </Link>
          )}
          <Link
            href={upgradeHref}
            className={
              isPro
                ? "app-button-native inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-800"
                : "app-button-native inline-flex rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
            }
          >
            {isAppShell ? "Businessプランを申し込む" : "Businessプラン（¥3,480/月）"}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="app-button-native rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
