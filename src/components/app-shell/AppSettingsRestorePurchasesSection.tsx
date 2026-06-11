"use client";

import { useCallback, useState } from "react";
import { restoreAppleSubscriptions } from "@/lib/apple-iap-client";
import { isNativeIapAvailable } from "@/lib/native-iap";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";

export function AppSettingsRestorePurchasesSection() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRestore = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await restoreAppleSubscriptions();
      const planLabel =
        result.plan === "business" ? "Business" : result.plan === "pro" ? "Pro" : "Free";
      setMessage(`購入情報を同期しました（${planLabel}プラン）。プランタブでご確認ください。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "購入の復元に失敗しました");
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
