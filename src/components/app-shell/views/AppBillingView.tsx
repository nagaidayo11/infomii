"use client";

import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";
import { AppTabPage } from "../primitives/AppTabPage";

export function AppBillingView() {
  return (
    <AppTabPage
      title="プラン"
      description="今のプラン確認とアップグレード。お申し込みは App Store 経由です。"
      className="pb-8"
      contentClassName="app-plan-page-content"
    >
      <BusinessPlanSection
        layout="app"
        successPath="/settings/billing?billing=success"
        cancelPath="/settings/billing"
      />
    </AppTabPage>
  );
}
