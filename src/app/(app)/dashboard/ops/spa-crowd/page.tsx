"use client";

import { Suspense } from "react";
import { LiveOpsQuickOps } from "@/components/ops/LiveOpsQuickOps";

/**
 * Front-desk Quick Ops — spa / bath crowd level switcher.
 */
export default function SpaCrowdOpsPage() {
  return (
    <Suspense
      fallback={
        <div className="app-main-container mx-auto max-w-lg space-y-3 py-6">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      }
    >
      <LiveOpsQuickOps opsKey="spaCrowd" />
    </Suspense>
  );
}
