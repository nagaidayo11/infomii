import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";

/**
 * プラン・請求（アプリタブ「プラン」向け）。Stripe Checkout / Customer Portal。
 */
export default function SettingsBillingPage() {
  return (
    <div className="app-main-container space-y-6 pb-4">
      <header className="app-page-header">
        <h1 className="app-page-title">プラン</h1>
        <p className="app-page-subtitle">
          料金プランの確認とアップグレード。お支払いは Stripe の安全な決済ページで行います。
        </p>
      </header>

      <BusinessPlanSection
        successPath="/settings/billing?billing=success"
        cancelPath="/settings/billing"
      />
    </div>
  );
}
