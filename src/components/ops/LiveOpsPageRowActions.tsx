"use client";

import Link from "next/link";
import {
  LIVE_OPS_DEFINITIONS,
  buildLiveOpsHref,
  type LiveOpsKey,
} from "@/lib/editor/live-ops";

const SHORT_LABEL: Record<LiveOpsKey, string> = {
  breakfastCrowd: "朝食混雑",
  dinnerCrowd: "夕食混雑",
  spaCrowd: "大浴場混雑",
};

type LiveOpsPageRowActionsProps = {
  pageId: string;
  keys: LiveOpsKey[];
  className?: string;
};

/** Compact Quick Ops links for a page that has the matching live-ops blocks. */
export function LiveOpsPageRowActions({ pageId, keys, className = "" }: LiveOpsPageRowActionsProps) {
  if (keys.length === 0) return null;

  return (
    <div className={"flex flex-wrap items-center gap-1.5 " + className}>
      {keys.map((key) => (
        <Link
          key={key}
          href={buildLiveOpsHref(key, pageId)}
          className="app-button-native inline-flex min-h-[40px] items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-900 transition hover:bg-emerald-100 sm:min-h-0"
          title={`${LIVE_OPS_DEFINITIONS[key].defaultTitle}をクイック切替`}
        >
          {SHORT_LABEL[key]}
        </Link>
      ))}
    </div>
  );
}
