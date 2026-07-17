import { canUseDevBusinessOverride } from "@/lib/dev-business-override";
import {
  formatCreatePageLimitError,
  PLAN_PAGE_LIMITS,
  resolveEffectivePageLimit,
  resolvePlanTierFromSubscription,
  type PlanLimitTier,
} from "@/lib/plan-limits";
import type { SupabaseClient } from "@supabase/supabase-js";

type AuthLikeUser = {
  email?: string | null;
  app_metadata?: unknown;
  user_metadata?: unknown;
};

export type HotelPageQuota = {
  plan: PlanLimitTier;
  /** Raw DB plan before override / normalization */
  storedPlan: string | null;
  pageCount: number;
  limit: number;
  allowed: boolean;
  overrideApplied: boolean;
};

/**
 * Single source of truth for create-page ceilings on the server.
 * Applies the same Dev Business override the client uses for Plan UI,
 * so AI / API routes cannot reject while the app shows Business.
 */
export async function resolveHotelPageQuota(params: {
  admin: SupabaseClient;
  hotelId: string;
  user: AuthLikeUser | null | undefined;
}): Promise<HotelPageQuota> {
  const { admin, hotelId, user } = params;

  const [{ data: sub }, { count }] = await Promise.all([
    admin
      .from("subscriptions")
      .select("plan,max_published_pages,status")
      .eq("hotel_id", hotelId)
      .maybeSingle(),
    admin.from("pages").select("id", { count: "exact", head: true }).eq("hotel_id", hotelId),
  ]);

  const pageCount = count ?? 0;
  const storedPlan = typeof sub?.plan === "string" ? sub.plan : null;
  let plan = resolvePlanTierFromSubscription(storedPlan);
  const overrideApplied = canUseDevBusinessOverride(user);
  if (overrideApplied) {
    plan = "business";
  }

  const limit = sub
    ? resolveEffectivePageLimit({
        plan,
        storedMax: typeof sub.max_published_pages === "number" ? sub.max_published_pages : null,
        existingCount: pageCount,
      })
    : overrideApplied
      ? PLAN_PAGE_LIMITS.business
      : PLAN_PAGE_LIMITS.free;

  return {
    plan,
    storedPlan,
    pageCount,
    limit,
    allowed: pageCount < limit,
    overrideApplied,
  };
}

export function pageQuotaForbiddenPayload(quota: HotelPageQuota): { error: string } {
  return { error: formatCreatePageLimitError(quota.plan, quota.limit) };
}
