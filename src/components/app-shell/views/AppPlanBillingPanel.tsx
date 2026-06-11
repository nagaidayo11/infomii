"use client";

import type { ReactNode } from "react";
import { openAppleSubscriptionManagement } from "@/lib/app-billing-nav";
import type { AppleIapInterval } from "@/lib/apple-iap-products";
import { AppPlanTiers } from "./AppPlanTiers";

type PlanId = "free" | "pro" | "business";

type AppPlanBillingPanelProps = {
  plan: PlanId;
  isPaid: boolean;
  isAppleBilling: boolean;
  billingInterval: AppleIapInterval;
  billingIntervalToggle: ReactNode;
  busyAction: "pro" | "business" | "portal" | null;
  canManageBilling: boolean;
  showAppPurchaseActions: boolean;
  onSubscribePro: () => void;
  onSubscribeBusiness: () => void;
  onUpgradeBusiness: () => void;
  onRestore: () => void;
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
  busyAction,
  canManageBilling,
  showAppPurchaseActions,
  onSubscribePro,
  onSubscribeBusiness,
  onUpgradeBusiness,
  onRestore,
  message,
}: AppPlanBillingPanelProps) {
  if (!showAppPurchaseActions) return null;

  const busy = busyAction !== null || !canManageBilling;

  return (
    <div className="app-plan-billing-panel">
      <div className="app-plan-section-block">
        <p className="app-plan-section-label">
          {plan === "free" ? "1. お支払い周期を選ぶ" : plan === "business" ? "ご契約中のプラン" : "1. プラン内容を確認"}
        </p>
        {plan !== "business" ? billingIntervalToggle : null}
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

          {plan === "business" && isAppleBilling ? (
            <ActionButton
              variant="secondary"
              disabled={busy}
              onClick={() => openAppleSubscriptionManagement()}
            >
              App Store で解約・プラン変更
            </ActionButton>
          ) : null}

          <ActionButton variant="ghost" disabled={busy} onClick={onRestore}>
            {busyAction === "portal" ? "処理中…" : "別デバイスで購入した場合は復元"}
          </ActionButton>
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
    </div>
  );
}
