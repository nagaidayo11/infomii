"use client";

import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";

export function AppBillingView() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-5 pb-8">
      <header className="app-screen-header">
        <h1 className="text-[1.75rem] font-bold text-[var(--app-text)]">プラン</h1>
        <p className="app-screen-header-desc text-base text-[var(--app-text-muted)]">
          料金プランの確認とアップグレード。お支払いは Stripe の安全な決済ページで行います。
        </p>
      </header>

      <div className="space-y-4 [&_section]:app-shell-card [&_section]:overflow-hidden [&_h2]:text-base [&_h2]:font-bold">
        <BusinessPlanSection
          successPath="/settings/billing?billing=success"
          cancelPath="/settings/billing"
        />
      </div>
    </div>
  );
}
