"use client";

import type { KeyboardEvent } from "react";
import type { AppleIapInterval } from "@/lib/apple-iap-products";
import { PLAN_FEATURE_BULLETS } from "@/lib/plan-limits";
import { PLAN_ANNUAL_SAVINGS_LABEL, PLAN_PRICE_DISPLAY } from "@/lib/plan-pricing";

type PlanId = "free" | "pro" | "business";

type AppPlanTiersProps = {
  currentPlan: PlanId;
  busyAction: "pro" | "business" | "portal" | null;
  billingInterval?: AppleIapInterval;
  /** When false, tiers are comparison-only (actions live in separate buttons). */
  interactive?: boolean;
  onSelectPro?: () => void;
  onSelectBusiness?: () => void;
  showFreeTier?: boolean;
};

const PLAN_FEATURES: Record<PlanId, string[]> = PLAN_FEATURE_BULLETS;

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
  billingInterval = "monthly",
  interactive = true,
}: {
  plan: PlanId;
  currentPlan: PlanId;
  busyAction: AppPlanTiersProps["busyAction"];
  billingInterval?: AppleIapInterval;
  onSelect?: () => void;
  showPopular?: boolean;
  interactive?: boolean;
}) {
  const isCurrent = plan === currentPlan;
  const selectable = interactive && Boolean(onSelect);
  const action = interactive ? tierActionLabel(plan, currentPlan, busyAction === plan) : null;
  const price =
    plan === "free"
      ? "¥0"
      : billingInterval === "yearly"
        ? plan === "pro"
          ? `${PLAN_PRICE_DISPLAY.pro.annual}/年`
          : `${PLAN_PRICE_DISPLAY.business.annual}/年`
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
      {...(selectable ? tierSelectProps(onSelect) : {})}
      className={
        "app-plan-row" +
        (isCurrent ? " app-plan-row--current" : "") +
        (selectable ? " app-plan-row--selectable ui-pop-tap" : "")
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
        {annual && billingInterval === "monthly" ? (
          <p className="app-plan-row-annual">
            年払い {annual}（{PLAN_ANNUAL_SAVINGS_LABEL}）
          </p>
        ) : null}
        {annual && billingInterval === "yearly" ? (
          <p className="app-plan-row-annual">
            {plan === "pro"
              ? PLAN_PRICE_DISPLAY.pro.effectiveMonthlyFromAnnual
              : PLAN_PRICE_DISPLAY.business.effectiveMonthlyFromAnnual}
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
  billingInterval = "monthly",
  interactive = true,
  onSelectPro,
  onSelectBusiness,
  showFreeTier = false,
}: AppPlanTiersProps) {
  const tiers: PlanId[] = showFreeTier
    ? ["free", "pro", "business"]
    : currentPlan === "free"
      ? ["pro", "business"]
      : currentPlan === "pro"
        ? ["pro", "business"]
        : ["business"];

  if (tiers.length === 0) return null;

  return (
    <div className="app-plan-tier-list">
      {tiers.map((tier) => (
        <PlanRow
          key={tier}
          plan={tier}
          currentPlan={currentPlan}
          busyAction={busyAction}
          billingInterval={billingInterval}
          interactive={interactive}
          onSelect={
            !interactive
              ? undefined
              : tier === "pro"
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
