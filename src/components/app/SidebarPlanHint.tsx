"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardBootstrapData } from "@/lib/storage";
import { resolvePlanTierFromSubscription } from "@/lib/plan-limits";

const PLAN_LABELS = { free: "Free", pro: "Pro", business: "Business" } as const;

/** Sidebar footer — current plan + publish quota (best-effort fetch). */
export function SidebarPlanHint() {
  const [label, setLabel] = useState<string | null>(null);
  const [usage, setUsage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getDashboardBootstrapData()
      .then((data) => {
        if (cancelled || !data?.subscription) return;
        const tier = resolvePlanTierFromSubscription(data.subscription.plan);
        setLabel(`${PLAN_LABELS[tier]} プラン`);
        if (tier === "business") {
          setUsage(`公開 ${data.publishedPageCount} / 無制限`);
        } else {
          setUsage(`公開 ${data.publishedPageCount} / ${data.subscription.maxPublishedPages}`);
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!label) return null;

  return (
    <Link
      href="/settings/billing"
      className="mb-2 block rounded-lg border border-[#e6e8eb] bg-slate-50/80 px-3 py-2.5 transition hover:bg-slate-100"
    >
      <p className="text-xs font-semibold text-slate-800">{label}</p>
      {usage ? <p className="mt-0.5 text-[11px] text-slate-500">{usage}</p> : null}
    </Link>
  );
}
