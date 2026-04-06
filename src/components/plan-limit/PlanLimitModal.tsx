"use client";

import Link from "next/link";

type PlanLimitModalProps = {
  open: boolean;
  onClose: () => void;
  message?: string;
  /** 現在のプラン。Pro の場合は Business のみ案内。 */
  currentPlan?: "free" | "pro" | "business";
};

const pricingHref = "/lp/saas#pricing";

/**
 * ページ数上限到達時に表示するモーダル。Pro/Business プランへのアップグレードを促す。
 */
export function PlanLimitModal({ open, onClose, message, currentPlan = "free" }: PlanLimitModalProps) {
  if (!open) return null;

  const isPro = currentPlan === "pro";
  const defaultMessage = isPro
    ? "Proプランでは10ページまでです。Businessプランにアップグレードすると無制限で作成できます。"
    : "無料プランでは1ページまで作成できます。Proプランで10ページ、Businessプランで無制限まで拡張できます。";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-limit-title"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
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
              href={pricingHref}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Proプラン（¥1,980/月）
            </Link>
          )}
          <Link
            href={pricingHref}
            className={
              isPro
                ? "rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                : "rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            }
          >
            Businessプラン（¥4,980/月）
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
