"use client";

import Link from "next/link";
import { formatRelativeTimeJa } from "@/lib/format-relative-time";
import { PageStatusPill } from "@/components/ui/PageStatusPill";

type DashboardContinueCardProps = {
  pageId: string;
  title: string;
  status: "draft" | "published";
  updatedAt: string;
};

/** Web dashboard — pick up where you left off. */
export function DashboardContinueCard({ pageId, title, status, updatedAt }: DashboardContinueCardProps) {
  const displayTitle = title.trim() || "（無題）";

  return (
    <section className="saas-card overflow-hidden">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">続きから</span>
            <PageStatusPill status={status} />
          </div>
          <h2 className="mt-1.5 truncate text-lg font-semibold tracking-tight text-slate-900">{displayTitle}</h2>
          <p className="mt-0.5 text-sm text-slate-500">最終更新 {formatRelativeTimeJa(updatedAt)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/editor/${pageId}`}
            className="app-button-native inline-flex min-h-[40px] items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium !text-white transition hover:bg-slate-800 hover:!text-white"
          >
            編集を続ける
          </Link>
        </div>
      </div>
    </section>
  );
}
