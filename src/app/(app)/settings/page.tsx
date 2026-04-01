import { BusinessAuditLogExport } from "@/components/settings/BusinessAuditLogExport";
import { BusinessGuestFooterSettings } from "@/components/settings/BusinessGuestFooterSettings";
import { BusinessPlanSection } from "@/components/settings/BusinessPlanSection";
import { InfomiiManual } from "@/components/settings/InfomiiManual";

/**
 * 設定ページ — Business 特典の案内と、Infomii 利用マニュアル
 */
export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">設定</h1>
        <p className="mt-2 text-sm text-slate-600">
          プランの案内と、Infomii でできることの一覧です。見出しのリンクから、そのまま各画面に移動できます。
        </p>
      </header>

      <BusinessPlanSection />

      <BusinessGuestFooterSettings />

      <BusinessAuditLogExport />

      <section aria-labelledby="manual-heading">
        <h2 id="manual-heading" className="mb-4 text-lg font-semibold text-slate-900">
          利用マニュアル
        </h2>
        <InfomiiManual />
      </section>
    </div>
  );
}
