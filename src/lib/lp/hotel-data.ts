/** ホテル向け LP（/lp/business）のコピー・料金・セクション定義 */

import { PLAN_PRICE_DISPLAY } from "@/lib/plan-pricing";
import { LP_TRUST_POINTS } from "@/lib/lp/plans";

export const HOTEL_LP_TRUST_POINTS = LP_TRUST_POINTS;

/** 現場の悩みと Infomii での解決を1セットで見せる */
export const HOTEL_LP_VALUE_POINTS = [
  {
    title: "同じ説明を繰り返さない",
    body: "Wi-Fi・朝食・チェックアウトをQRで自己解決。忙しい時間帯の口頭案内を減らします。",
  },
  {
    title: "紙の差し替えから解放",
    body: "朝食時間や館内ルールは編集してすぐ公開。印刷・配布のたびに現場が止まる状態を解消します。",
  },
  {
    title: "多言語もまとめて運用",
    body: "主要言語の案内を1ページでそろえ、ゲストごとの情報格差を減らします（Businessで多言語反映）。",
  },
  {
    title: "QRひとつで案内を統一",
    body: "客室・フロント・館内の案内先を同じURLに。迷子の問い合わせと案内ミスを防ぎます。",
  },
  {
    title: "変更はその場で反映",
    body: "臨時休業や時間変更も、スマホから更新してすぐゲストに届きます。",
  },
  {
    title: "接続手順を固定できる",
    body: "Wi-Fi案内を1ページに固定。ゲストもスタッフも迷いにくくなります。",
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
    desc: "ホテル・旅館・民泊向けの案内テンプレから開始。白紙でもOK。",
  },
  {
    step: "2",
    title: "現場向けに整える",
    desc: "Wi-Fi・朝食・FAQ・チェックアウトをブロックで並べ、スマホ表示を確認。",
  },
  {
    step: "3",
    title: "QRを置いて運用",
    desc: "公開URLを発行し、客室カードやフロントに掲示。以降は編集だけ。",
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
    after: "スマホ1ページで常に最新",
  },
  {
    before: "Wi-Fi接続を口頭で説明",
    after: "QRで手順を自己解決",
  },
  {
    before: "朝食変更のたびに現場がバタつく",
    after: "編集→公開で数分反映",
  },
  {
    before: "多言語案内が英語だけ",
    after: "主要言語をまとめて運用（Business）",
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
    tagline: "まず1つ作って試す",
    priceLabel: "¥0",
    features: [
      "QR公開・共有URL",
      "基本ページ（最大3本）",
      "ホテル向けテンプレ利用",
      "スマホ対応プレビュー",
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
    tagline: "もっと綺麗に、もっと整理しやすく",
    priceLabel: PLAN_PRICE_DISPLAY.pro.monthly,
    priceSuffix: "/月",
    features: [
      "公開ページ最大10本",
      "閲覧分析",
      "用途別にページを分けて運用",
      "日々の更新が多い1拠点向け",
      "テンプレ・QR運用はそのまま",
    ],
    ctaLabel: "Proを試す",
    ctaVariant: "primary",
    recommended: true,
    footnote: "まずFreeで試してからでもOK",
  },
  {
    id: "business",
    name: "Business",
    tagline: "複数施設や運用チーム向け",
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
    a: "はい。3ページまでQR公開できます。ページ数や分析が必要になったらPro、チーム・多言語が必要ならBusinessが目安です。",
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
