/**
 * 料金表示の単一ソース（税込・円）。
 * Stripe の Price は環境変数で別管理。金額変更時は Stripe Dashboard で新 Price を作成し ID を差し替える。
 */
export const PLAN_MONTHLY_YEN = {
  pro: 1280,
  business: 3480,
} as const;

/** 年額 = 月額 × 10（12ヶ月のうち2ヶ月分お得） */
export const PLAN_ANNUAL_YEN = {
  pro: 12_800,
  business: 34_800,
} as const;

export const PLAN_ANNUAL_SAVINGS_LABEL = "2ヶ月分お得";

export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export const PLAN_PRICE_DISPLAY = {
  pro: {
    monthly: formatYen(PLAN_MONTHLY_YEN.pro),
    monthlyPerMonth: `${formatYen(PLAN_MONTHLY_YEN.pro)}/月`,
    annual: formatYen(PLAN_ANNUAL_YEN.pro),
    annualButton: `年払い ${formatYen(PLAN_ANNUAL_YEN.pro)}（${PLAN_ANNUAL_SAVINGS_LABEL}）`,
    effectiveMonthlyFromAnnual: `実質 ${formatYen(Math.round(PLAN_ANNUAL_YEN.pro / 12))}/月`,
  },
  business: {
    monthly: formatYen(PLAN_MONTHLY_YEN.business),
    monthlyPerMonth: `${formatYen(PLAN_MONTHLY_YEN.business)}/月`,
    annual: formatYen(PLAN_ANNUAL_YEN.business),
    annualButton: `年払い ${formatYen(PLAN_ANNUAL_YEN.business)}（${PLAN_ANNUAL_SAVINGS_LABEL}）`,
    effectiveMonthlyFromAnnual: `実質 ${formatYen(Math.round(PLAN_ANNUAL_YEN.business / 12))}/月`,
  },
} as const;

/** 特商法・commerce 用の一文 */
export const COMMERCE_PRICING_LINE =
  `Freeプラン: 0円 / Proプラン: 月額${PLAN_MONTHLY_YEN.pro.toLocaleString("ja-JP")}円（年払い${PLAN_ANNUAL_YEN.pro.toLocaleString("ja-JP")}円・${PLAN_ANNUAL_SAVINGS_LABEL}） / ` +
  `Businessプラン: 月額${PLAN_MONTHLY_YEN.business.toLocaleString("ja-JP")}円（年払い${PLAN_ANNUAL_YEN.business.toLocaleString("ja-JP")}円・${PLAN_ANNUAL_SAVINGS_LABEL}）`;
