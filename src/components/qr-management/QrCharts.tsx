"use client";

import type { QrScanDayBucket } from "@/lib/storage";

type QrChartsProps = {
  daily: QrScanDayBucket[];
  qrScans7d: number;
  mostViewedTitle: string | null;
  mostViewedQrCount: number;
};

function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(d);
}

/**
 * Simple bar chart for last 7 days QR scans — CSS only, no chart library.
 */
export function QrCharts({
  daily,
  qrScans7d,
  mostViewedTitle,
  mostViewedQrCount,
}: QrChartsProps) {
  const max = Math.max(1, ...daily.map((d) => d.count));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">
          過去7日のQRスキャン
        </h3>
        <p className="mt-1 text-xs text-slate-500">日別の推移</p>
        <div className="mt-4 flex h-40 items-end justify-between gap-1 px-1">
          {daily.map((bucket) => {
            const h = Math.round((bucket.count / max) * 100);
            return (
              <div
                key={bucket.date}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <span className="text-[10px] font-medium tabular-nums text-slate-600">
                  {bucket.count}
                </span>
                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className="w-full max-w-[28px] rounded-t-md bg-emerald-500 transition-all"
                    style={{
                      height: `${Math.max(8, h)}%`,
                      minHeight: bucket.count > 0 ? 12 : 4,
                    }}
                    title={`${bucket.date}: ${bucket.count}`}
                  />
                </div>
                <span className="truncate text-[10px] text-slate-400">
                  {formatDayLabel(bucket.date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">QRスキャン合計</h3>
        <p className="mt-1 text-xs text-slate-500">直近7日</p>
        <p className="mt-4 text-4xl font-bold tabular-nums tracking-tight text-slate-900">
          {qrScans7d}
        </p>
        <div className="mt-6 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-medium uppercase tracking-wider text-slate-500">
            QR経由が多いページ
          </h4>
          {mostViewedTitle ? (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <span className="truncate text-sm font-medium text-slate-800">
                {mostViewedTitle}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-emerald-700">
                QR {mostViewedQrCount}
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">データがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
