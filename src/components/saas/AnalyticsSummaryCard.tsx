"use client";

import Link from "next/link";

type AnalyticsSummaryCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
  /** 指定時はカード全体が分析などへのリンクになる */
  href?: string;
};

export function AnalyticsSummaryCard({
  label,
  value,
  sub,
  className = "",
  href,
}: AnalyticsSummaryCardProps) {
  const shell =
    "rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 " +
    className;

  const inner = (
    <>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {sub != null && sub !== "" && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={shell + " block"}>
        {inner}
      </Link>
    );
  }

  return <div className={shell}>{inner}</div>;
}
