"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildDashboardSetupSteps,
  readSetupChecklistDismissed,
  setupProgress,
  writeSetupChecklistDismissed,
  type SetupStep,
} from "@/lib/dashboard-setup";

type DashboardSetupChecklistProps = {
  hotelName: string;
  pageCount: number;
  publishedCount: number;
  qrViews7d: number;
  canEdit: boolean;
};

function StepRow({ step, isNext }: { step: SetupStep; isNext: boolean }) {
  return (
    <li
      className={
        "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors " +
        (isNext && !step.done ? "bg-emerald-50/80 ring-1 ring-emerald-100" : "")
      }
    >
      <span
        className={
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold " +
          (step.done
            ? "bg-emerald-600 text-white"
            : "border border-slate-300 bg-white text-transparent")
        }
        aria-hidden
      >
        {step.done ? (
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className={"text-sm font-medium " + (step.done ? "text-slate-500 line-through" : "text-slate-900")}>
          {step.label}
        </p>
        {!step.done ? <p className="mt-0.5 text-xs text-slate-500">{step.description}</p> : null}
      </div>
      {!step.done ? (
        <Link
          href={step.href}
          className="app-button-native shrink-0 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium !text-white transition hover:bg-slate-800 hover:!text-white"
        >
          進む
        </Link>
      ) : null}
    </li>
  );
}

export function DashboardSetupChecklist({
  hotelName,
  pageCount,
  publishedCount,
  qrViews7d,
  canEdit,
}: DashboardSetupChecklistProps) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(readSetupChecklistDismissed());
  }, []);

  const steps = useMemo(
    () =>
      buildDashboardSetupSteps({
        hotelName,
        pageCount,
        publishedCount,
        qrViews7d,
        canEdit,
      }),
    [hotelName, pageCount, publishedCount, qrViews7d, canEdit],
  );

  const { done, total, allDone } = setupProgress(steps);

  useEffect(() => {
    if (allDone && !dismissed) {
      writeSetupChecklistDismissed();
      setDismissed(true);
    }
  }, [allDone, dismissed]);

  if (!canEdit || steps.length === 0 || dismissed || allDone) {
    return null;
  }

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const nextStep = steps.find((s) => !s.done);

  return (
    <section className="saas-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#e6e8eb] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">はじめのセットアップ</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {nextStep ? `次は「${nextStep.label}」` : "あと少しで完了です"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-[120px] flex-1 sm:min-w-[140px]">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>{done}/{total} 完了</span>
              <span>{pct}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              writeSetupChecklistDismissed();
              setDismissed(true);
            }}
            className="shrink-0 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            非表示
          </button>
        </div>
      </div>
      <ul className="divide-y divide-[#e6e8eb] px-2 py-1 sm:px-3">
        {steps.map((step) => (
          <StepRow key={step.id} step={step} isNext={step.id === nextStep?.id} />
        ))}
      </ul>
    </section>
  );
}
