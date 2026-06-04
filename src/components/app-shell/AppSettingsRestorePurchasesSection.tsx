"use client";

import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { getWebBillingUrl } from "@/lib/app-store-compliance";

/**
 * Infomii bills via Stripe on the web — no StoreKit products. Explains restore expectations for reviewers.
 */
export function AppSettingsRestorePurchasesSection() {
  const billingUrl = getWebBillingUrl();

  return (
    <AppSettingsCard>
      <h2 className="text-base font-semibold text-[var(--app-text)]">購入の復元について</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
        本アプリでは App Store 経由の課金は行っていません。Pro / Business プランは Web（Stripe）でお申し込みいただきます。
        契約の確認・解約はプラン画面の「請求情報を管理」、または
        {" "}
        <a href={billingUrl} className="font-medium text-[var(--app-accent)] underline">
          Web の請求ページ
        </a>
        から行えます。
      </p>
    </AppSettingsCard>
  );
}
