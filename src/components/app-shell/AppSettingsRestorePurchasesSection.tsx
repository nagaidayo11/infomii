"use client";

import { restoreAppleSubscriptions } from "@/lib/apple-iap-client";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { useCallback, useState } from "react";

export function AppSettingsRestorePurchasesSection() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
    <AppSettingsCard padding="none" className="app-settings-restore-card">
      <p className="px-4 py-3 text-sm leading-relaxed text-[var(--app-text-muted)]">
        以前 App Store でお申し込みいただいた Pro / Business プランは、下のボタンから同じ Infomii
        アカウントへ復元できます。
      </p>
      <button
        type="button"
        onClick={() => void handleRestore()}
        disabled={busy}
        className="app-settings-danger-btn app-pressable w-full px-4 py-3.5 text-center text-base font-semibold disabled:opacity-60"
      >
        {busy ? "復元中…" : "App Store の購入を復元"}
      </button>
      {message ? <p className="px-4 py-2 text-sm text-[var(--app-text-muted)]">{message}</p> : null}
    </AppSettingsCard>
  );
}
