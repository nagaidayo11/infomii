"use client";

import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";
import { AppBillingView } from "@/components/app-shell/views/AppBillingView";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { PageHelp } from "@/components/help/PageHelp";
import { PAGE_HELP } from "@/lib/page-help-content";

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
      <header className="app-page-header flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="app-page-title">プラン</h1>
          <p className="app-page-subtitle">
            料金プランの確認とアップグレード。お支払いは安全な決済ページで行います。
          </p>
        </div>
        <PageHelp
          className="shrink-0 self-start sm:self-auto"
          title={PAGE_HELP.billing.title}
          description={PAGE_HELP.billing.description}
          items={[...PAGE_HELP.billing.items]}
        />
      </header>

      <BusinessPlanSection
        successPath="/settings/billing?billing=success"
        cancelPath="/settings/billing"
      />
    </div>
  );
}
