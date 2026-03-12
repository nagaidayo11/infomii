"use client";

import type { ReactNode } from "react";

type DashboardHeaderBarProps = {
  hotelName: string;
  onEditHotelName?: () => void;
  actions?: ReactNode;
};

/**
 * Top bar: hotel name + quick actions (Stripe-style clean header).
 */
export function DashboardHeaderBar({
  hotelName,
  onEditHotelName,
  actions,
}: DashboardHeaderBarProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white px-6 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            施設
          </p>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {hotelName || "Infomii"}
            </h1>
            {onEditHotelName && (
              <button
                type="button"
                onClick={onEditHotelName}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                aria-label="施設名を編集"
              >
                編集
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            ゲスト向け案内ページの管理
          </p>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
