"use client";

import type { ReactNode } from "react";
import { openAppleSubscriptionManagement } from "@/lib/app-billing-nav";
import { billingIntervalLabel, type BillingInterval } from "@/lib/billing-interval";
import type { AppleIapInterval } from "@/lib/apple-iap-products";
import { PLAN_ANNUAL_SAVINGS_LABEL, PLAN_PRICE_DISPLAY } from "@/lib/plan-pricing";
import { AppPlanLegalFootnote } from "./AppPlanLegalFootnote";
import { AppPlanTiers } from "./AppPlanTiers";

type PlanId = "free" | "pro" | "business";

type AppPlanBillingPanelProps = {
  plan: PlanId;
  isPaid: boolean;
  isAppleBilling: boolean;
  billingInterval: AppleIapInterval;
  activeBillingInterval: BillingInterval | null;
  billingIntervalToggle: ReactNode;
  busyAction: "pro" | "business" | "portal" | null;
  canManageBilling: boolean;
  showAppPurchaseActions: boolean;
  onSubscribePro: () => void;
  onSubscribeBusiness: () => void;
  onUpgradeBusiness: () => void;
  onSwitchToAnnual: () => void;
  message: string | null;
};

function ActionButton({
  variant,
  onClick,
  disabled,
  children,
}: {
  variant: "primary" | "secondary" | "ghost";
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const className =
    variant === "primary"
      ? "app-plan-cta-primary app-pressable ui-pop-tap"
      : variant === "secondary"
        ? "app-plan-cta-secondary app-pressable ui-pop-tap"
        : "app-plan-restore-btn app-pressable ui-pop-tap";
  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function AppPlanBillingPanel({
  plan,
  isPaid,
  isAppleBilling,
  billingIntervalToggle,
  billingInterval,
  activeBillingInterval,
  busyAction,
  canManageBilling,
  showAppPurchaseActions,
  onSubscribePro,
  onSubscribeBusiness,
  onUpgradeBusiness,
  onSwitchToAnnual,
  message,
}: AppPlanBillingPanelProps) {
  if (!showAppPurchaseActions) return null;

  const busy = busyAction !== null || !canManageBilling;
  const isOnMonthly = isPaid && activeBillingInterval !== "yearly";
  const annualPriceLabel =
    plan === "pro"
      ? PLAN_PRICE_DISPLAY.pro.annual
      : plan === "business"
        ? PLAN_PRICE_DISPLAY.business.annual
        : null;

  return (
    <div className="app-plan-billing-panel">
      <div className="app-plan-section-block">
        <p className="app-plan-section-label">
          {plan === "free"
            ? "1. お支払い周期を選ぶ"
            : isPaid
              ? "ご契約中のお支払い周期"
              : "1. プラン内容を確認"}
        </p>
        {plan === "free" ? billingIntervalToggle : null}
        {plan === "pro" ? (
          <>
            {activeBillingInterval ? (
              <p className="app-plan-interval-current">
                現在: {billingIntervalLabel(activeBillingInterval)}
                {activeBillingInterval === "yearly" ? `（${PLAN_ANNUAL_SAVINGS_LABEL}）` : null}
              </p>
            ) : null}
            <p className="app-plan-interval-note">Business へのアップグレード時の周期</p>
            {billingIntervalToggle}
          </>
        ) : null}
        {plan === "business" && activeBillingInterval ? (
          <p className="app-plan-interval-current">
            現在: {billingIntervalLabel(activeBillingInterval)}
            {activeBillingInterval === "yearly" ? `（${PLAN_ANNUAL_SAVINGS_LABEL}）` : null}
          </p>
        ) : null}
      </div>

      <div className="app-plan-section-block">
        <p className="app-plan-section-label">
          {plan === "free" ? "2. プランを比較" : plan === "pro" ? "2. アップグレード先" : "プラン詳細"}
        </p>
        <AppPlanTiers
          currentPlan={plan}
          busyAction={busyAction}
          billingInterval={billingInterval}
          interactive={false}
          onSelectPro={undefined}
          onSelectBusiness={undefined}
          showFreeTier={false}
        />
      </div>

      <div className="app-plan-section-block">
        <p className="app-plan-section-label">
          {plan === "free" ? "3. お申し込み" : isPaid ? "プランの変更・解約" : "お申し込み"}
        </p>
        <div className="app-plan-action-stack">
          {plan === "free" ? (
            <>
              <ActionButton
                variant="primary"
                disabled={busy}
                onClick={onSubscribePro}
              >
                {busyAction === "pro" ? "処理中…" : "Pro を申し込む（App Store）"}
              </ActionButton>
              <ActionButton
                variant="secondary"
                disabled={busy}
                onClick={onSubscribeBusiness}
              >
                {busyAction === "business" ? "処理中…" : "Business を申し込む（App Store）"}
              </ActionButton>
            </>
          ) : null}

          {plan === "pro" ? (
            <>
              {isOnMonthly ? (
                <ActionButton variant="secondary" disabled={busy} onClick={onSwitchToAnnual}>
                  {busyAction === plan
                    ? "処理中…"
                    : `年払いに切り替える（${annualPriceLabel ?? ""}・${PLAN_ANNUAL_SAVINGS_LABEL}）`}
                </ActionButton>
              ) : null}
              <ActionButton variant="primary" disabled={busy} onClick={onUpgradeBusiness}>
                {busyAction === "business" ? "処理中…" : "Business にアップグレード（App Store）"}
              </ActionButton>
              {isAppleBilling ? (
                <ActionButton
                  variant="secondary"
                  disabled={busy}
                  onClick={() => openAppleSubscriptionManagement()}
                >
                  App Store で解約・プラン変更
                </ActionButton>
              ) : null}
            </>
          ) : null}

          {plan === "business" ? (
            <>
              {isOnMonthly ? (
                <ActionButton variant="primary" disabled={busy} onClick={onSwitchToAnnual}>
                  {busyAction === plan
                    ? "処理中…"
                    : `年払いに切り替える（${annualPriceLabel ?? ""}・${PLAN_ANNUAL_SAVINGS_LABEL}）`}
                </ActionButton>
              ) : null}
              {isAppleBilling ? (
                <ActionButton
                  variant="secondary"
                  disabled={busy}
                  onClick={() => openAppleSubscriptionManagement()}
                >
                  App Store で解約・プラン変更
                </ActionButton>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <details className="app-plan-sandbox-guide">
        <summary>テスト購入（TestFlight）で解約を確認するには</summary>
        <div className="app-plan-sandbox-guide-body">
          <p>
            サンドボックスのテスト購入は、通常の「設定 → サブスクリプション」に
            <strong> Infomii が表示されない</strong>ことがあります。次のいずれかで確認できます。
          </p>
          <ol>
            <li>
              上の<strong>「App Store で解約・プラン変更」</strong>をタップ（Apple の管理画面が開きます）
            </li>
            <li>
              設定 → <strong>App Store</strong> → 一番下の<strong>サンドボックスアカウント</strong>
              → サブスクリプションを管理
            </li>
            <li>
              設定 → 開発者 → <strong>Sandbox Apple Account</strong>（表示される場合）
            </li>
          </ol>
          <p className="app-plan-sandbox-guide-note">
            テスト環境では更新周期が短く（数分〜）なります。実際の課金は発生しません。
          </p>
        </div>
      </details>

      {message ? <p className="app-plan-message">{message}</p> : null}

      <AppPlanLegalFootnote />
    </div>
  );
}
