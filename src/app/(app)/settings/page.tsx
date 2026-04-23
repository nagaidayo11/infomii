import { BusinessAuditLogExport } from "@/components/settings/BusinessAuditLogExport";
import { AccountAuthLinkSection } from "@/components/settings/AccountAuthLinkSection";
import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";
import { ProfileDisplayNameSection } from "@/components/settings/ProfileDisplayNameSection";

/**
 * 設定ページ — プラン・Business向け設定
 */
export default function SettingsPage() {
  return (
    <div className="app-main-container space-y-6 pb-10">
      <header className="app-page-header">
        <h1 className="app-page-title">設定</h1>
        <p className="app-page-subtitle">
          プランの案内と、Business向けの設定項目です。
        </p>
      </header>

      <ProfileDisplayNameSection />

      <BusinessPlanSection />

      <AccountAuthLinkSection />

      <BusinessAuditLogExport />
    </div>
  );
}
