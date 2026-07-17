"use client";

import { useEffect, useState } from "react";
import { resolvePlanTierFromSubscription, type PlanLimitTier } from "@/lib/plan-limits";
import { getCurrentHotelSubscription } from "@/lib/storage";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

export type HotelPlanAccess = {
  planTier: PlanLimitTier;
  isBusiness: boolean;
  /** First subscription fetch finished (success or failure). */
  resolved: boolean;
};

/**
 * Loads the current hotel plan tier for client UI gating.
 * Retries on auth/session changes so early mounts do not stick on "free".
 */
export function useHotelPlanAccess(disabled = false): HotelPlanAccess {
  const [planTier, setPlanTier] = useState<PlanLimitTier>("free");
  const [resolved, setResolved] = useState(disabled);

  useEffect(() => {
    if (disabled) {
      setPlanTier("free");
      setResolved(true);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const sub = await getCurrentHotelSubscription();
        if (!cancelled) {
          setPlanTier(resolvePlanTierFromSubscription(sub?.plan));
          setResolved(true);
        }
      } catch {
        if (!cancelled) {
          setResolved(true);
        }
      }
    };

    void load();

    const supabase = getBrowserSupabaseClient();
    const { data: authListener } = supabase?.auth.onAuthStateChange(() => {
      void load();
    }) ?? { data: { subscription: null } };

    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      authListener.subscription?.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [disabled]);

  return {
    planTier,
    isBusiness: planTier === "business",
    resolved,
  };
}

/** @deprecated alias — prefer useHotelPlanAccess when gating UI before first fetch. */
export function useHotelPlanTier(disabled = false): PlanLimitTier {
  return useHotelPlanAccess(disabled).planTier;
}
