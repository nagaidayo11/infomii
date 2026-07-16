"use client";

import { Suspense } from "react";
import { BreakfastCrowdQuickOps } from "@/components/ops/BreakfastCrowdQuickOps";

/**
 * Front-desk Quick Ops — breakfast crowd level switcher.
 * Auth via (app) AuthGate; mutations use browser Supabase + RLS.
 */
export default function BreakfastCrowdOpsPage() {
  return (
    <Suspense
      fallback={
        <div className="app-main-container mx-auto max-w-lg space-y-3 py-6">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      }
    >
      <BreakfastCrowdQuickOps />
    </Suspense>
  );
}
