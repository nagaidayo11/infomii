"use client";

type AnalyticsSummaryCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
};

export function AnalyticsSummaryCard({ label, value, sub, className = "" }: AnalyticsSummaryCardProps) {
  return (
    <div
      className={
        "rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] " + className
      }
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {sub != null && sub !== "" && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
