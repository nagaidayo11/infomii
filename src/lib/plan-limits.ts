/** Canonical published-page limits by subscription tier (LP / app / web must match). */

export type PlanLimitTier = "free" | "pro" | "business";

export function resolveMaxPublishedPagesByPlan(plan: PlanLimitTier): number {
  if (plan === "business") return 999;
  if (plan === "pro") return 10;
  return 3;
}

/** Plan tier is the source of truth; ignore stale max_published_pages in DB. */
export function normalizeMaxPublishedPages(
  plan: PlanLimitTier,
  _storedMax?: number | null,
): number {
  return resolveMaxPublishedPagesByPlan(plan);
}

export function formatPublishLimitError(plan: PlanLimitTier, limit: number): string {
  if (plan === "business") {
    return `公開上限（${limit}件）に達しました。`;
  }
  if (plan === "pro") {
    return `Proプランの公開上限（${limit}件）に達しました。Businessプランで無制限まで拡張できます。`;
  }
  return `無料プランの公開上限（${limit}件）に達しました。Proプランで10ページまで公開できます。`;
}
