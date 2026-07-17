/** Canonical plan limits — LP / settings / editor / APIs must share this module. */

export type PlanLimitTier = "free" | "pro" | "business";

/** Normalize subscription.plan (or similar) into a plan tier for UI gating. */
export function resolvePlanTierFromSubscription(
  plan: string | null | undefined,
): PlanLimitTier {
  if (plan === "business" || plan === "pro") return plan;
  return "free";
}

/** Published + created page ceiling by tier (new accounts). */
export const PLAN_PAGE_LIMITS = {
  free: 2,
  pro: 20,
  business: 999,
} as const satisfies Record<PlanLimitTier, number>;

/**
 * Previous Free ceiling. Hotels already over the new Free cap keep this
 * effective limit so existing 3-page Free tenants are not blocked mid-flight.
 */
export const LEGACY_FREE_PAGE_LIMIT = 3;

/**
 * Max enabled guest-nav items (tabs or hamburger rows) when chrome is on.
 * Locale tab counts toward the cap only when multilingual is available (Business).
 */
export const PLAN_GUEST_NAV_LINK_LIMITS = {
  free: 3,
  pro: 5,
  business: 5,
} as const satisfies Record<PlanLimitTier, number>;

export function resolveMaxPublishedPagesByPlan(plan: PlanLimitTier): number {
  return PLAN_PAGE_LIMITS[plan];
}

/**
 * Soft-normalize stored max_published_pages.
 * - New Free → 2
 * - Free still stored as legacy 3 → keep 3 (do not shrink on read)
 * - Paid tiers → canonical
 */
export function normalizeMaxPublishedPages(
  plan: PlanLimitTier,
  storedMax?: number | null,
): number {
  const canonical = resolveMaxPublishedPagesByPlan(plan);
  if (plan === "free") {
    if (typeof storedMax === "number" && storedMax >= LEGACY_FREE_PAGE_LIMIT) {
      return LEGACY_FREE_PAGE_LIMIT;
    }
    return canonical;
  }
  return canonical;
}

/**
 * Effective create/publish ceiling.
 * If a Free hotel already has more pages/published items than the new Free
 * cap (e.g. 3), keep LEGACY_FREE_PAGE_LIMIT so they aren't suddenly stuck.
 */
export function resolveEffectivePageLimit(args: {
  plan: PlanLimitTier;
  storedMax?: number | null;
  /** pages rows or published informations currently held by the hotel */
  existingCount?: number;
}): number {
  const normalized = normalizeMaxPublishedPages(args.plan, args.storedMax);
  if (args.plan !== "free") return normalized;

  const existing = Math.max(0, args.existingCount ?? 0);
  if (existing > PLAN_PAGE_LIMITS.free) {
    return Math.min(LEGACY_FREE_PAGE_LIMIT, Math.max(normalized, existing));
  }
  return normalized;
}

export function resolveGuestNavLinkLimit(plan: PlanLimitTier): number {
  return PLAN_GUEST_NAV_LINK_LIMITS[plan];
}

export function planHasMultilingual(plan: PlanLimitTier): boolean {
  return plan === "business";
}

export function planHasTeam(plan: PlanLimitTier): boolean {
  return plan === "business";
}

export function planHasAnalytics(plan: PlanLimitTier): boolean {
  return plan === "pro" || plan === "business";
}

export function planHasAnalyticsCsv(plan: PlanLimitTier): boolean {
  return plan === "business";
}

export function planHasDynamicBusinessBlocks(plan: PlanLimitTier): boolean {
  return plan === "business";
}

export function planHasProPromoBlocks(plan: PlanLimitTier): boolean {
  return plan === "pro" || plan === "business";
}

/** Human-readable page cap for UI (Business → 無制限). */
export function formatPlanPageLimitLabel(plan: PlanLimitTier): string {
  if (plan === "business") return "無制限";
  return `${PLAN_PAGE_LIMITS[plan]}ページ`;
}

export function formatPublishLimitError(plan: PlanLimitTier, limit: number): string {
  if (plan === "business") {
    return `公開上限（${limit}件）に達しました。`;
  }
  if (plan === "pro") {
    return `Proプランの公開上限（${limit}件）に達しました。Businessプランで無制限まで拡張できます。`;
  }
  return `無料プランの公開上限（${limit}件）に達しました。Proプランで${PLAN_PAGE_LIMITS.pro}ページまで公開できます。`;
}

export function formatCreatePageLimitError(plan: PlanLimitTier, limit: number): string {
  if (plan === "business") {
    return `ページ数の上限に達しました（${limit}件）。`;
  }
  if (plan === "pro") {
    return `ページ数の上限に達しました（${limit}件）。Businessプランで無制限まで拡張できます。`;
  }
  return `ページ数の上限に達しました（${limit}件）。Proプランで${PLAN_PAGE_LIMITS.pro}ページまで作成できます。`;
}

/** Short feature bullets for settings / app plan cards. */
export const PLAN_FEATURE_BULLETS: Record<PlanLimitTier, string[]> = {
  free: [
    `${PLAN_PAGE_LIMITS.free}ページ公開`,
    "基本編集・テンプレ",
    "ゲストナビ（リンク少数）",
    "QR共有 / 下書き切替",
  ],
  pro: [
    `最大${PLAN_PAGE_LIMITS.pro}ページ公開`,
    "閲覧分析",
    "訴求ブロック（ティッカー・クーポン等）",
    "ゲストナビ（フル）",
  ],
  business: [
    "公開ページ無制限",
    "多言語編集・ゲスト言語切替",
    "チーム招待・権限",
    "動的ブロック（期間・時間帯）",
    "分析CSV・運用統制",
  ],
};

/**
 * SQL to run in the Infomii Supabase SQL Editor (not the NAGI project).
 * Lists Free hotels that already have 3+ published pages.
 */
export const FREE_LEGACY_OVER_CAP_AUDIT_SQL = `
select
  s.hotel_id,
  h.name as hotel_name,
  s.plan,
  s.max_published_pages,
  s.status,
  coalesce(pub.published_count, 0) as published_count,
  coalesce(pg.page_count, 0) as page_count
from public.subscriptions s
left join public.hotels h on h.id = s.hotel_id
left join lateral (
  select count(*)::int as published_count
  from public.informations i
  where i.hotel_id = s.hotel_id and i.status = 'published'
) pub on true
left join lateral (
  select count(*)::int as page_count
  from public.pages p
  where p.hotel_id = s.hotel_id
) pg on true
where s.plan = 'free'
  and coalesce(pub.published_count, 0) >= 3
order by published_count desc, s.hotel_id;
`;
