"use client";

import Link from "next/link";

type PlanLimitModalProps = {
  open: boolean;
  onClose: () => void;
  message?: string;
};

/**
 * ページ数上限到達時に表示するモーダル。Proプランへのアップグレードを促す。
 */
export function PlanLimitModal({ open, onClose, message }: PlanLimitModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-limit-title"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="plan-limit-title" className="text-lg font-semibold text-slate-900">
          ページ数の上限に達しました
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {message ?? "無料プランでは1ページまで作成できます。Proプランにアップグレードすると5ページまで作成できます。"}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            料金・Proプラン
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
