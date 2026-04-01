"use client";

import { useCallback, useEffect, useState } from "react";
import { triggerAuditLogCsvDownload } from "@/lib/audit-log-csv-export";
import { getCurrentHotelSubscription, listCurrentHotelAuditLogs } from "@/lib/storage";
import { Card } from "@/components/ui/Card";

const AUDIT_EXPORT_LIMIT = 500;

/**
 * Business のみ: 施設の監査ログを CSV でダウンロード
 */
export function BusinessAuditLogExport() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBusiness, setIsBusiness] = useState(false);
  const [planLoaded, setPlanLoaded] = useState(false);

  useEffect(() => {
    void getCurrentHotelSubscription().then((s) => {
      setIsBusiness(s?.plan === "business");
      setPlanLoaded(true);
    });
  }, []);

  const handleExport = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const sub = await getCurrentHotelSubscription();
      if (sub?.plan !== "business") {
        setError("この機能は Business プランでご利用いただけます");
        return;
      }
      const logs = await listCurrentHotelAuditLogs(AUDIT_EXPORT_LIMIT);
      triggerAuditLogCsvDownload(logs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ダウンロードに失敗しました");
    } finally {
      setBusy(false);
    }
  }, []);

  if (!planLoaded) {
    return (
      <Card padding="lg">
        <div className="h-20 animate-pulse rounded-lg bg-slate-100" aria-hidden />
      </Card>
    );
  }

  if (!isBusiness) return null;

  return (
    <Card padding="lg" className="border-slate-200">
      <h2 className="text-base font-semibold text-slate-900">監査ログ（CSV）</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        施設内の主な操作履歴（公開・招待・課金関連など）を、最大 {AUDIT_EXPORT_LIMIT} 件まで CSV
        で保存できます。経理・内部共有用にご利用ください。
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleExport()}
        className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 sm:min-h-0"
      >
        {busy ? "作成中…" : "CSVをダウンロード"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
