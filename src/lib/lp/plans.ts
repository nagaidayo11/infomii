/** LP 料金プラン（/lp/saas・/lp/business 共通） */

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
    tagline: "まず1つ作って試す",
    priceLabel: "¥0",
    features: [
      "QR公開・共有URL",
      "基本ページ（最大3本）",
      "テンプレ利用",
      "スマホ対応プレビュー",
      "下書き / 公開切り替え",
    ],
    ctaLabel: "無料ではじめる",
    highlighted: true,
    footnote: "クレジットカード不要・登録だけで始められます",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "もっと綺麗に、もっと整理しやすく",
    priceLabel: PLAN_PRICE_DISPLAY.pro.monthly,
    priceSuffix: "/月",
    features: [
      "公開ページ最大10本",
      "閲覧分析",
      "用途別にページを分けて運用",
      "日々の更新が多い方向け",
      "テンプレ・QR共有はそのまま",
    ],
    ctaLabel: "Proを試す",
    recommended: true,
    footnote: `まずFreeで試してからでもOK · 年払い${PLAN_PRICE_DISPLAY.pro.annual}（${PLAN_PRICE_DISPLAY.pro.effectiveMonthlyFromAnnual}）`,
  },
  {
    id: "business",
    name: "Business",
    tagline: "チーム・複数用途の本格運用向け",
    priceLabel: PLAN_PRICE_DISPLAY.business.monthly,
    priceSuffix: "/月",
    features: [
      "公開ページ無制限",
      "チーム招待・権限管理",
      "公開時の多言語自動翻訳",
      "閲覧分析・運用統制",
      "動的ブロック（緊急バナー等）",
    ],
    ctaLabel: "Businessを見る",
    footnote: `宿泊施設のチーム運用向け · 年払い${PLAN_PRICE_DISPLAY.business.annual}（${PLAN_PRICE_DISPLAY.business.effectiveMonthlyFromAnnual}）`,
  },
];

export const LP_TRUST_POINTS = ["クレジットカード不要", "数分で公開", "いつでも変更可能"] as const;
