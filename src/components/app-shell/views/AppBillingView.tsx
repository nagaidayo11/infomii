"use client";

import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";
import { AppSection } from "../primitives/AppSection";

export function AppBillingView() {
  return (
    <div className="app-billing-page app-shell-page-enter mx-auto w-full max-w-lg space-y-5 pb-8">
      <header className="app-screen-header">
        <h1 className="text-[1.75rem] font-bold text-[var(--app-text)]">プラン</h1>
        <p className="app-screen-header-desc text-base text-[var(--app-text-muted)]">
          料金プランの確認とアップグレード。お支払いは Stripe の安全な決済ページで行います。
        </p>
      </header>

      <AppSection className="app-billing-content">
        <BusinessPlanSection
          layout="app"
          successPath="/settings/billing?billing=success"
          cancelPath="/settings/billing"
        />
      </AppSection>
    </div>
  );
}
