"use client";

import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";
import { AppBillingView } from "@/components/app-shell/views/AppBillingView";
import { useClientShell } from "@/components/app-shell/useClientShell";

/**
 * プラン・請求（Web ブラウザ向け）。
 */
export default function SettingsBillingPage() {
  const { isAppShell } = useClientShell();

  if (isAppShell) {
    return <AppBillingView />;
  }

  return (
    <div className="app-main-container space-y-6 pb-4">
      <header className="app-page-header">
        <h1 className="app-page-title">プラン</h1>
        <p className="app-page-subtitle">
          料金プランの確認とアップグレード。お支払いは安全な決済ページで行います。
        </p>
      </header>

      <BusinessPlanSection
        successPath="/settings/billing?billing=success"
        cancelPath="/settings/billing"
      />
    </div>
  );
}
