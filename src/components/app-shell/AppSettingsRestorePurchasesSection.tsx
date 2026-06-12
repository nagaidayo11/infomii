"use client";

import { useCallback, useState } from "react";
import { restoreAppleSubscriptions } from "@/lib/apple-iap-client";
import { openWebBillingManagement } from "@/lib/app-billing-nav";
import { isNativeIapAvailable } from "@/lib/native-iap";
import {
  getCurrentHotelSubscription,
  syncStripeSubscriptionFromServer,
} from "@/lib/storage";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";

export function AppSettingsRestorePurchasesSection() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRestore = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      const sub = await getCurrentHotelSubscription();
      const stripeManaged =
        Boolean(sub?.hasStripeCustomer) || sub?.billingProvider === "stripe";
      if (stripeManaged) {
        await syncStripeSubscriptionFromServer();
        setMessage("ご契約情報を同期しました。プランタブでご確認ください。");
        return;
      }

      const result = await restoreAppleSubscriptions();
      const planLabel =
        result.plan === "business" ? "Business" : result.plan === "pro" ? "Pro" : "Free";
      setMessage(`購入情報を同期しました（${planLabel}プラン）。プランタブでご確認ください。`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "購入の復元に失敗しました";
      if (msg.includes("プラン画面から")) {
        window.alert(msg);
        openWebBillingManagement();
        return;
      }
      setMessage(msg);
    } finally {
      setBusy(false);
    }
  }, []);

  if (!isNativeIapAvailable()) return null;

  return (
    <AppSettingsCard padding="none" className="app-settings-restore-card">
      <button
        type="button"
        onClick={() => void handleRestore()}
        disabled={busy}
        className="app-settings-restore-btn app-pressable w-full px-4 py-3.5 text-center text-base font-semibold text-[var(--app-text)] disabled:opacity-60"
      >
        {busy ? "同期中…" : "購入を復元"}
      </button>
      {message ? <p className="px-4 pb-3 text-sm text-[var(--app-text-muted)]">{message}</p> : null}
    </AppSettingsCard>
  );
}
