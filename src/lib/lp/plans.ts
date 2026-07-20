/** LP 料金プラン（/lp/business） */

import { PLAN_FEATURE_BULLETS, PLAN_PAGE_LIMITS } from "@/lib/plan-limits";
import { PLAN_PRICE_DISPLAY } from "@/lib/plan-pricing";

export type LpPlanId = "free" | "pro" | "business";

export type LpPlanDefinition = {
  id: LpPlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  priceSuffix?: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
  recommended?: boolean;
  footnote?: string;
};

export const LP_PLANS: LpPlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    tagline: "まず1つ作って公開する",
    priceLabel: "¥0",
    features: [
      "QR公開・共有URL",
      `基本ページ（最大${PLAN_PAGE_LIMITS.free}本）`,
      "テンプレ利用",
      "ゲストナビ（リンク少数）",
      "下書き / 公開切り替え",
    ],
    ctaLabel: "無料ではじめる",
    highlighted: true,
    footnote: "クレジットカード不要・登録だけで始められます",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "ページを増やし、数字で改善する",
    priceLabel: PLAN_PRICE_DISPLAY.pro.monthly,
    priceSuffix: "/月",
    features: [
      `公開ページ最大${PLAN_PAGE_LIMITS.pro}本`,
      "閲覧分析",
      "訴求ブロック（ティッカー・クーポン等）",
      "用途別にページを分けて運用",
      "ゲストナビ（フル）",
    ],
    ctaLabel: "Proを試す",
    recommended: true,
    footnote: `まずFreeで試してからでもOK · 年払い${PLAN_PRICE_DISPLAY.pro.annual}（${PLAN_PRICE_DISPLAY.pro.effectiveMonthlyFromAnnual}）`,
  },
  {
    id: "business",
    name: "Business",
    tagline: "多言語・チーム・施設単位で回す",
    priceLabel: PLAN_PRICE_DISPLAY.business.monthly,
    priceSuffix: "/月",
    features: [
      "公開ページ無制限",
      "公開時の多言語自動翻訳",
      "チーム招待・権限管理",
      "動的ブロック（期間・時間帯）",
      "分析CSV・運用統制",
    ],
    ctaLabel: "Businessを見る",
    footnote: `宿泊施設の本格運用向け · 年払い${PLAN_PRICE_DISPLAY.business.annual}（${PLAN_PRICE_DISPLAY.business.effectiveMonthlyFromAnnual}）`,
  },
];

/** Keep bullets available for other LP surfaces. */
export { PLAN_FEATURE_BULLETS };

export const LP_TRUST_POINTS = ["クレジットカード不要", "数分で公開", "いつでも変更可能"] as const;
