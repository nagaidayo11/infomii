"use client";

import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";

export function AppBillingView() {
  return (
    <div className="app-billing-page app-shell-page-enter mx-auto w-full max-w-lg pb-8">
      <header className="app-screen-header">
        <h1 className="text-[1.75rem] font-bold text-[var(--app-text)]">プラン</h1>
      </header>

      <BusinessPlanSection
        layout="app"
        successPath="/settings/billing?billing=success"
        cancelPath="/settings/billing"
      />
    </div>
  );
}
