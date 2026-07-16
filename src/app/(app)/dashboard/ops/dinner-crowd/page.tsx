"use client";

import { Suspense } from "react";
import { LiveOpsQuickOps } from "@/components/ops/LiveOpsQuickOps";

/**
 * Front-desk Quick Ops — dinner / restaurant crowd level switcher.
 */
export default function DinnerCrowdOpsPage() {
  return (
    <Suspense
      fallback={
        <div className="app-main-container mx-auto max-w-lg space-y-3 py-6">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      }
    >
      <LiveOpsQuickOps opsKey="dinnerCrowd" />
    </Suspense>
  );
}
