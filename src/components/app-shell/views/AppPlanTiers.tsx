"use client";

import type { KeyboardEvent } from "react";
import { PLAN_ANNUAL_SAVINGS_LABEL, PLAN_PRICE_DISPLAY } from "@/lib/plan-pricing";

type PlanId = "free" | "pro" | "business";

type AppPlanTiersProps = {
  currentPlan: PlanId;
  busyAction: "pro" | "business" | "portal" | null;
  onSelectPro?: () => void;
  onSelectBusiness?: () => void;
  showFreeTier?: boolean;
};

const PLAN_FEATURES: Record<PlanId, string[]> = {
  free: ["3ページ公開", "基本編集", "QR共有"],
  pro: ["最大10ページ", "閲覧分析", "用途別に運用"],
  business: ["公開無制限", "多言語翻訳", "チーム招待", "動的ブロック"],
};

function tierActionLabel(plan: PlanId, current: PlanId, busy: boolean): string | null {
  if (plan === current) return null;
  if (busy) return "処理中…";
  if (current === "free") return "申し込む";
  if (current === "pro" && plan === "business") return "アップグレード";
  return null;
}

function tierSelectProps(onSelect?: () => void) {
  if (!onSelect) return {};
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick: onSelect,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    },
  };
}

function PlanRow({
  plan,
  currentPlan,
  busyAction,
  onSelect,
  showPopular,
}: {
  plan: PlanId;
  currentPlan: PlanId;
  busyAction: AppPlanTiersProps["busyAction"];
  onSelect?: () => void;
  showPopular?: boolean;
}) {
  const isCurrent = plan === currentPlan;
  const action = tierActionLabel(plan, currentPlan, busyAction === plan);
  const price =
    plan === "free"
      ? "¥0"
      : plan === "pro"
        ? PLAN_PRICE_DISPLAY.pro.monthlyPerMonth
        : PLAN_PRICE_DISPLAY.business.monthlyPerMonth;
  const annual =
    plan === "pro"
      ? PLAN_PRICE_DISPLAY.pro.annual
      : plan === "business"
        ? PLAN_PRICE_DISPLAY.business.annual
        : null;

  return (
    <div
      {...tierSelectProps(onSelect)}
      className={
        "app-plan-row" +
        (isCurrent ? " app-plan-row--current" : "") +
        (onSelect ? " app-plan-row--selectable ui-pop-tap" : "")
      }
    >
      <div className="app-plan-row-main">
        <div className="app-plan-row-head">
          <p className="app-plan-row-name">
            {plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Business"}
          </p>
          {isCurrent ? <span className="app-plan-row-badge">現在</span> : null}
          {showPopular && !isCurrent ? <span className="app-plan-row-popular">人気</span> : null}
        </div>
        <p className="app-plan-row-price">{price}</p>
        {annual ? (
          <p className="app-plan-row-annual">
            年払い {annual}（{PLAN_ANNUAL_SAVINGS_LABEL}）
          </p>
        ) : null}
        <ul className="app-plan-row-features">
          {PLAN_FEATURES[plan].map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>
      {action ? (
        <span className="app-plan-row-action" aria-hidden>
          {action}
        </span>
      ) : null}
    </div>
  );
}

export function AppPlanTiers({
  currentPlan,
  busyAction,
  onSelectPro,
  onSelectBusiness,
  showFreeTier = false,
}: AppPlanTiersProps) {
  const tiers: PlanId[] = showFreeTier
    ? ["free", "pro", "business"]
    : currentPlan === "free"
      ? ["pro", "business"]
      : currentPlan === "pro"
        ? ["business"]
        : [];

  if (tiers.length === 0) return null;

  return (
    <div className="app-plan-tier-list">
      {tiers.map((tier) => (
        <PlanRow
          key={tier}
          plan={tier}
          currentPlan={currentPlan}
          busyAction={busyAction}
          onSelect={
            tier === "pro"
              ? busyAction === "pro"
                ? undefined
                : onSelectPro
              : tier === "business"
                ? busyAction === "business"
                  ? undefined
                  : onSelectBusiness
                : undefined
          }
          showPopular={tier === "business"}
        />
      ))}
    </div>
  );
}
