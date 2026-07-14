/** ホテル向け LP（/lp/business）のコピー・料金・セクション定義 */

import { PLAN_PAGE_LIMITS } from "@/lib/plan-limits";
import { PLAN_PRICE_DISPLAY } from "@/lib/plan-pricing";
import { LP_TRUST_POINTS } from "@/lib/lp/plans";

export const HOTEL_LP_TRUST_POINTS = LP_TRUST_POINTS;

/**
 * 現場あるある → Infomii でどう軽くなるか（機能カタログ調を避ける）
 */
export const HOTEL_LP_VALUE_POINTS = [
  {
    title: "「Wi-Fiどうやるの？」が減る",
    body: "客室やフロントのQRから接続手順を開いてもらうので、口頭説明の回数を抑えられます。",
  },
  {
    title: "朝食時間の差し替えが、印刷待ちにならない",
    body: "変更したら公開するだけ。冊子の刷り直しやフロントでの貼紙交換が要らなくなります。",
  },
  {
    title: "客室ごとに案内がバラつかない",
    body: "同じURLを客室カード・フロント・館内掲示で共用。情報のズレと案内ミスを防ぎます。",
  },
  {
    title: "臨時の休館・時間変更もその場で",
    body: "大浴場やレストランの当日変更も、スマホから直してすぐゲストへ届きます。",
  },
  {
    title: "英語だけの案内で止まらない",
    body: "主要言語を1つのページでそろえられます（多言語反映はBusiness）。インバウンド対応のたたき台になります。",
  },
  {
    title: "少人数フロントでも回せる",
    body: "テンプレから始めて、必要な項目だけ足す運用。IT専任がいなくても更新できます。",
  },
] as const;

/** @deprecated Use HOTEL_LP_VALUE_POINTS */
export const HOTEL_LP_PAIN_POINTS = HOTEL_LP_VALUE_POINTS;

/** @deprecated Use HOTEL_LP_VALUE_POINTS */
export const HOTEL_LP_OPERATIONS_BENEFITS = HOTEL_LP_VALUE_POINTS;

export const HOTEL_LP_WORKFLOW_STEPS = [
  {
    step: "1",
    title: "テンプレを選ぶ",
    desc: "ホテル・旅館向けの案内ページから開始。あなたの施設名と写真に差し替えます。",
  },
  {
    step: "2",
    title: "滞在に必要な情報を入れる",
    desc: "Wi-Fi・食事時間・館内・周辺など、現場で聞かれやすい項目をブロックで並べます。",
  },
  {
    step: "3",
    title: "QRを出して運用する",
    desc: "公開URLを客室カードやフロントに。以降の変更は編集してすぐ反映です。",
  },
] as const;

export const HOTEL_LP_PROPERTY_TYPES = [
  "シティホテル",
  "温泉旅館",
  "リゾート",
  "ビジネスホテル",
  "民泊・小規模宿",
] as const;

export const HOTEL_LP_BEFORE_AFTER = [
  {
    before: "紙の館内案内を都度印刷・配布",
    after: "ゲストのスマホで常に最新のインフォメーション",
  },
  {
    before: "Wi-Fi接続を口頭で何度も説明",
    after: "QRを開けば手順がそのまま読める",
  },
  {
    before: "朝食変更のたびに貼紙と印刷が走る",
    after: "編集して公開するだけで反映",
  },
  {
    before: "多言語案内が英語だけで不足",
    after: "主要言語をまとめて運用できる（Business）",
  },
] as const;

export type HotelPlanId = "free" | "pro" | "business";

export type HotelPlanDefinition = {
  id: HotelPlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  priceSuffix?: string;
  features: string[];
  ctaLabel: string;
  ctaVariant: "primary" | "secondary";
  highlighted?: boolean;
  recommended?: boolean;
  footnote?: string;
};

/** 表示価格（Stripe 実績と commerce 表記に合わせる） */
export const HOTEL_PLANS: HotelPlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    tagline: "まず1つ作って公開する",
    priceLabel: "¥0",
    features: [
      "QR公開・共有URL",
      `基本ページ（最大${PLAN_PAGE_LIMITS.free}本）`,
      "ホテル向けテンプレ利用",
      "ゲストナビ（リンク少数）",
      "下書き / 公開切り替え",
    ],
    ctaLabel: "無料ではじめる",
    ctaVariant: "primary",
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
    ctaVariant: "primary",
    recommended: true,
    footnote: "まずFreeで試してからでもOK",
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
    ctaVariant: "secondary",
    footnote: "複数拠点・担当者での継続運用向け",
  },
];

export const HOTEL_LP_FAQ = [
  {
    q: "ITに詳しくなくても更新できますか？",
    a: "はい。文章の差し替えとブロックの並べ替えが中心です。まずFreeで1ページ作り、慣れてから拡張できます。",
  },
  {
    q: "無料プランだけでも運用できますか？",
    a: `はい。${PLAN_PAGE_LIMITS.free}ページまでQR公開できます。ページ数や分析が必要になったらPro、チーム・多言語が必要ならBusinessが目安です。`,
  },
  {
    q: "デモで触った内容は本番に引き継げますか？",
    a: "デモは体験用です。実運用は無料登録後のダッシュボードでページを作成してください。",
  },
  {
    q: "民泊や小規模旅館でも使えますか？",
    a: "はい。チェックイン案内・ハウスルール・周辺情報など、少人数運用でもQR1つで案内をまとめられます。",
  },
  {
    q: "支払いはいつ必要ですか？",
    a: "Freeの開始にクレジットカードは不要です。Pro / Businessはアップグレード時にStripeでお支払いします。",
  },
] as const;

export const HOTEL_HERO_TEMPLATES = [
  {
    id: "city-hotel",
    label: "シティホテル",
    category: "ホテル",
    description: "Wi-Fi・朝食・館内ルールを1ページに",
    previewHref: "/demo/guest-live?embed=1&variant=city-hotel",
    openHref: "/demo/guest-live?variant=city-hotel",
  },
  {
    id: "resort",
    label: "リゾート",
    category: "旅館・リゾート",
    description: "アクティビティと送迎案内を整理",
    previewHref: "/demo/guest-live?embed=1&variant=resort",
    openHref: "/demo/guest-live?variant=resort",
  },
  {
    id: "ryokan",
    label: "温泉旅館",
    category: "旅館",
    description: "食事時間・温泉・館内マナーを集約",
    previewHref: "/demo/guest-live?embed=1&variant=ryokan",
    openHref: "/demo/guest-live?variant=ryokan",
  },
  {
    id: "business-hotel",
    label: "ビジネスホテル",
    category: "ホテル",
    description: "チェックイン・周辺・FAQを簡潔に",
    previewHref: "/demo/guest-live?embed=1&variant=business-hotel",
    openHref: "/demo/guest-live?variant=business-hotel",
  },
  {
    id: "glamping",
    label: "グランピング",
    category: "民泊・小規模宿",
    description: "持ち物・天候・食事案内をまとめて",
    previewHref: "/demo/guest-live?embed=1&variant=glamping",
    openHref: "/demo/guest-live?variant=glamping",
  },
] as const;
