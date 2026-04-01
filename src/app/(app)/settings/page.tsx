import { BusinessAuditLogExport } from "@/components/settings/BusinessAuditLogExport";
import { BusinessGuestFooterSettings } from "@/components/settings/BusinessGuestFooterSettings";
import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";

/**
 * 設定ページ — プラン・Business向け設定
 */
export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">設定</h1>
        <p className="mt-2 text-sm text-slate-600">
          プランの案内と、Business向けの設定項目です。使い方の全体は左メニューの「マニュアル」をご確認ください。
        </p>
      </header>

      <BusinessPlanSection />

      <BusinessGuestFooterSettings />

      <BusinessAuditLogExport />
    </div>
  );
}
