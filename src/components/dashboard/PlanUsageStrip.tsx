"use client";

import Link from "next/link";
import { resolvePlanTierFromSubscription, type PlanLimitTier } from "@/lib/plan-limits";

const PLAN_LABELS: Record<PlanLimitTier, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

type PlanUsageStripProps = {
  plan: string | null | undefined;
  publishedCount: number;
  maxPublishedPages: number;
};

/** Compact plan + publish quota for dashboard header area. */
export function PlanUsageStrip({ plan, publishedCount, maxPublishedPages }: PlanUsageStripProps) {
  const tier = resolvePlanTierFromSubscription(plan);
  const label = PLAN_LABELS[tier];
  const unlimited = tier === "business";
  const cap = unlimited ? null : Math.max(1, maxPublishedPages);
  const used = Math.max(0, publishedCount);
  const ratio = cap ? Math.min(1, used / cap) : 0;
  const nearLimit = cap !== null && used >= Math.max(1, cap - 1);

  return (
    <div className="saas-card flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {label} プラン
        </span>
        <span className="text-sm text-slate-600">
          公開 <span className="font-semibold tabular-nums text-slate-900">{used}</span>
          {unlimited ? (
            <span className="text-slate-500"> / 無制限</span>
          ) : (
            <>
              <span className="text-slate-400"> / </span>
              <span className="font-semibold tabular-nums text-slate-900">{cap}</span>
              <span className="text-slate-500"> ページ</span>
            </>
          )}
        </span>
        {nearLimit && !unlimited ? (
          <span className="text-xs font-medium text-amber-700">上限に近づいています</span>
        ) : null}
      </div>
      {!unlimited && cap ? (
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-xs">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className={
                "h-full rounded-full transition-all " + (nearLimit ? "bg-amber-500" : "bg-emerald-500")
              }
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
        </div>
      ) : null}
      <Link
        href="/settings/billing"
        className="shrink-0 text-xs font-medium text-slate-500 hover:text-slate-900"
      >
        プランと請求 →
      </Link>
    </div>
  );
}
