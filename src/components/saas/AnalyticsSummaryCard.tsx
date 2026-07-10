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

/** Quiet metric tile — Stripe-like, no heavy shadow. */
export function AnalyticsSummaryCard({
  label,
  value,
  sub,
  className = "",
  href,
}: AnalyticsSummaryCardProps) {
  const shell =
    "rounded-lg border border-[#e6e8eb] bg-white px-4 py-3.5 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 " +
    className;

  const inner = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
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
