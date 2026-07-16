"use client";

import type { PageQualityFinding } from "@/lib/editor/page-quality-checks";
import { pageQualitySummaryTitle } from "@/lib/editor/page-quality-checks";

type PageQualityChecksPanelProps = {
  findings: PageQualityFinding[];
  mode: "publish" | "preview";
  onClose: () => void;
  /** Focus first fixable finding (card select + scroll). */
  onFix: () => void;
  /** Soft continue for publish or preview. */
  onContinue?: () => void;
};

export function PageQualityChecksPanel({
  findings,
  mode,
  onClose,
  onFix,
  onContinue,
}: PageQualityChecksPanelProps) {
  const title = pageQualitySummaryTitle(findings, mode);
  const continueLabel = mode === "preview" ? "このままプレビュー" : "このまま公開";
  const showContinue = Boolean(onContinue);
  const fixable = findings.some((f) => Boolean(f.cardId));

  return (
    <div className="ui-overlay-fade fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div
        className="ui-pop-in w-full max-w-md rounded-lg border border-[#e6e8eb] bg-white p-5 shadow-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="page-quality-checks-title"
      >
        <h3 id="page-quality-checks-title" className="text-base font-semibold text-slate-900">
          {title}
        </h3>
        <ul className="mt-3 max-h-[min(40vh,280px)] space-y-1.5 overflow-y-auto overscroll-contain">
          {findings.map((finding, index) => (
            <li
              key={`${finding.code}-${finding.cardId ?? "page"}-${index}`}
              className="flex items-start gap-2 text-sm leading-snug text-slate-700"
            >
              <span
                className={
                  finding.severity === "error"
                    ? "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"
                    : "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                }
                aria-hidden
              />
              <span>{finding.message}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            閉じる
          </button>
          {fixable ? (
            <button
              type="button"
              onClick={onFix}
              className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              修正する
            </button>
          ) : null}
          {showContinue ? (
            <button
              type="button"
              onClick={onContinue}
              className="min-h-[44px] rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              {continueLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
