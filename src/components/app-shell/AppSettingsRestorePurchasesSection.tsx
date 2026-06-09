"use client";

import { restoreAppleSubscriptions } from "@/lib/apple-iap-client";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import {
  getWebPricingLpUrl,
  navigateToWebPricingLp,
  shouldUseAppleIapBilling,
} from "@/lib/app-store-compliance";
import { isNativeIapAvailable } from "@/lib/native-iap";
import { useCallback, useEffect, useState } from "react";

export function AppSettingsRestorePurchasesSection() {
  const pricingUrl = getWebPricingLpUrl();
  const [useIosIap, setUseIosIap] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setUseIosIap(shouldUseAppleIapBilling() && isNativeIapAvailable());
  }, []);

  const handleRestore = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      await restoreAppleSubscriptions();
      setMessage("購入情報を復元しました。プラン画面で契約状況をご確認ください。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "購入の復元に失敗しました。");
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <AppSettingsCard>
      <h2 className="text-base font-semibold text-[var(--app-text)]">購入の復元について</h2>
      {useIosIap ? (
        <>
          <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
            以前 App Store でお申し込みいただいた Pro / Business プランは、下のボタンから同じ Infomii
            アカウントへ復元できます。Web（Stripe）で契約中の場合はログインするだけでプランが反映されます。
          </p>
          <button
            type="button"
            onClick={() => void handleRestore()}
            disabled={busy}
            className="app-button-native app-touch-btn-primary ui-pop-tap mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[var(--app-accent)] px-4 py-2.5 text-sm font-semibold !text-white disabled:opacity-70"
          >
            {busy ? "復元中…" : "App Store の購入を復元"}
          </button>
        </>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
          Pro / Business プランは Web（Stripe）または iOS アプリ（App Store）でお申し込みいただけます。
          契約の確認・解約はプラン画面、または
          {" "}
          <a
            href={pricingUrl}
            className="font-medium text-[var(--app-accent)] underline"
            onClick={(e) => {
              e.preventDefault();
              navigateToWebPricingLp();
            }}
          >
            Web の請求ページ
          </a>
          から行えます。
        </p>
      )}
      {message ? <p className="mt-3 text-sm text-[var(--app-text-muted)]">{message}</p> : null}
    </AppSettingsCard>
  );
}
