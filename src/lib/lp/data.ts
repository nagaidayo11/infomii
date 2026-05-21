import {
  buildLpTemplatesLoginHref,
  LP_STARTER_TEMPLATE_SLUGS,
} from "@/lib/template-marketplace-meta";

/** public/lp 画像差し替え時にインクリメント（Next/Image・ブラウザキャッシュ対策） */
export const LP_ASSET_VERSION = "20260521b";

export function lpAsset(path: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}v=${LP_ASSET_VERSION}`;
}

export type HeroTemplatePreview = {
  id: string;
  label: string;
  tag: string;
  description: string;
  previewHref: string;
  openHref: string;
};

/** Hero 右スマホモック用（用途タグ切替） */
export const HERO_TEMPLATE_PREVIEWS: HeroTemplatePreview[] = [
  {
    id: "city-hotel",
    label: "ホテル案内",
    tag: "宿泊",
    description: "WiFi・朝食・館内ルールを1ページに",
    previewHref: `/demo/guest-live?embed=1&variant=city-hotel&lpv=${LP_ASSET_VERSION}`,
    openHref: "/demo/guest-live?variant=city-hotel",
  },
  {
    id: "travel",
    label: "旅行しおり",
    tag: "旅行",
    description: "予定・MAP・持ち物をまとめて共有",
    previewHref: `/demo/guest-live?embed=1&variant=travel&lpv=${LP_ASSET_VERSION}`,
    openHref: "/demo/guest-live?variant=travel",
  },
  {
    id: "oshi",
    label: "推し活スケジュール",
    tag: "推し活",
    description: "ライブ・遠征・グッズ情報を整理",
    previewHref: `/demo/guest-live?embed=1&variant=oshi&lpv=${LP_ASSET_VERSION}`,
    openHref: "/demo/guest-live?variant=oshi",
  },
  {
    id: "cafe",
    label: "カフェ巡り",
    tag: "おでかけ",
    description: "お店リストと混雑・営業時間",
    previewHref: `/demo/guest-live?embed=1&variant=cafe&lpv=${LP_ASSET_VERSION}`,
    openHref: "/demo/guest-live?variant=cafe",
  },
  {
    id: "event",
    label: "イベントまとめ",
    tag: "イベント",
    description: "会場・集合・リンクをひとつに",
    previewHref: `/demo/guest-live?embed=1&variant=event&lpv=${LP_ASSET_VERSION}`,
    openHref: "/demo/guest-live?variant=event",
  },
];

/** BtoC LP ヒーロー用（宿泊施設プレビューは除外） */
export const HERO_PERSONAL_TEMPLATE_PREVIEWS: HeroTemplatePreview[] = HERO_TEMPLATE_PREVIEWS.filter(
  (item) => item.id !== "city-hotel",
);

/** Hero デモ iframe 用（ローカル画像） */
export const LP_DEMO_HERO_IMAGES = {
  hotel: lpAsset("/lp/demo/hotel-hero.jpg"),
  travel: lpAsset("/lp/demo/travel-hero.jpg"),
  oshi: lpAsset("/lp/demo/oshi-hero.jpg"),
  event: lpAsset("/lp/demo/event-hero.jpg"),
  cafe: lpAsset("/lp/demo/cafe-hero.jpg"),
} as const;

export type LpUseCaseItem = {
  title: string;
  description: string;
  bannerSrc: string;
  bannerAlt: string;
};

export const LP_USE_CASES: LpUseCaseItem[] = [
  {
    title: "旅行しおり",
    description: "日程・MAP・持ち物を旅先で迷わず",
    bannerSrc: lpAsset("/lp/use-cases/travel.jpg"),
    bannerAlt: "旅行しおりのイメージ",
  },
  {
    title: "ホテル案内",
    description: "宿泊施設の案内をQRで共有",
    bannerSrc: lpAsset("/lp/use-cases/hotel.jpg"),
    bannerAlt: "ホテル案内のイメージ",
  },
  {
    title: "推し活",
    description: "ライブ・遠征の予定とリンク整理",
    bannerSrc: lpAsset("/lp/use-cases/oshi.jpg"),
    bannerAlt: "推し活スケジュールのイメージ",
  },
  {
    title: "ライブ遠征",
    description: "集合・会場・グッズ情報を1ページに",
    bannerSrc: lpAsset("/lp/use-cases/live-trip.jpg"),
    bannerAlt: "ライブ遠征のイメージ",
  },
  {
    title: "デートプラン",
    description: "お店・時間・予約リンクをまとめて",
    bannerSrc: lpAsset("/lp/use-cases/date.jpg"),
    bannerAlt: "デートプランのイメージ",
  },
  {
    title: "イベント共有",
    description: "参加者へ必要な情報だけ届ける",
    bannerSrc: lpAsset("/lp/use-cases/event.jpg"),
    bannerAlt: "イベント共有のイメージ",
  },
  {
    title: "カフェ巡り",
    description: "行きたいお店と営業時間を一覧",
    bannerSrc: lpAsset("/lp/use-cases/cafe.jpg"),
    bannerAlt: "カフェ巡りのイメージ",
  },
];

export const LP_FEATURES = [
  {
    title: "スケジュール",
    description: "予定を時系列で。旅行も推し活も見やすく。",
    scene: "旅行・ライブ遠征",
  },
  {
    title: "MAP",
    description: "場所を地図で。集合ポイントも伝わりやすく。",
    scene: "デート・イベント",
  },
  {
    title: "QR共有",
    description: "URLをQRに。印刷物やSNSからすぐ開ける。",
    scene: "ホテル・会場案内",
  },
  {
    title: "SNS共有",
    description: "InstagramやLINEに貼れる1リンク運用。",
    scene: "推し活・カフェ巡り",
  },
  {
    title: "リンク整理",
    description: "予約・地図・公式をボタンでまとめる。",
    scene: "イベント・旅行",
  },
  {
    title: "多言語",
    description: "Businessプランで公開時に主要言語へ展開。",
    scene: "宿泊施設・インバウンド",
  },
  {
    title: "モバイル最適化",
    description: "スマホ前提の読みやすいレイアウト。",
    scene: "すべての用途",
  },
] as const;

export type LpStarterTemplate = {
  id: string;
  title: string;
  description: string;
  /** Login → /templates with category + starter slug */
  href: string;
  imageSrc: string;
  imageAlt: string;
  templateCategory: string;
  starterSlug: string;
  accent: string;
  badge?: string;
};

export const LP_STARTER_TEMPLATES: LpStarterTemplate[] = [
  {
    id: "travel",
    title: "旅行テンプレ",
    description: "日程・MAP・持ち物チェックから始められる",
    href: buildLpTemplatesLoginHref("travel", LP_STARTER_TEMPLATE_SLUGS.travel),
    imageSrc: lpAsset("/templates/previews/travel/travel-itinerary.jpg"),
    imageAlt: "旅行しおりテンプレートのプレビュー",
    templateCategory: "travel",
    starterSlug: LP_STARTER_TEMPLATE_SLUGS.travel,
    accent: "from-emerald-50 to-white",
  },
  {
    id: "oshi",
    title: "推し活テンプレ",
    description: "ライブ予定・会場・リンク集の土台付き",
    href: buildLpTemplatesLoginHref("oshi", LP_STARTER_TEMPLATE_SLUGS.oshi),
    imageSrc: lpAsset("/templates/previews/oshi/oshi-live-set.jpg"),
    imageAlt: "推し活テンプレートのプレビュー",
    templateCategory: "oshi",
    starterSlug: LP_STARTER_TEMPLATE_SLUGS.oshi,
    accent: "from-teal-50/80 to-white",
  },
  {
    id: "city-hotel",
    title: "ホテル案内テンプレ",
    description: "WiFi・朝食・館内案内の定番構成",
    href: buildLpTemplatesLoginHref("business", LP_STARTER_TEMPLATE_SLUGS.hotel),
    imageSrc: lpAsset("/lp/templates/hotel.jpg"),
    imageAlt: "ホテル案内テンプレートのプレビュー",
    templateCategory: "business",
    starterSlug: LP_STARTER_TEMPLATE_SLUGS.hotel,
    accent: "from-slate-50 to-white",
    badge: "宿泊施設向け",
  },
];

export const LP_SOCIAL_PROOF = [
  { label: "宿泊施設での館内案内", detail: "QR1枚でWiFi・朝食・設備案内" },
  { label: "少人数ホテル・旅館", detail: "更新が早く、フロント負荷を軽減" },
  { label: "カフェ・サロン", detail: "メニューと予約導線をスマホに" },
] as const;

export const LP_FAQ = [
  {
    q: "個人でも使えますか？",
    a: "はい。旅行しおりや推し活まとめなど、個人の情報整理にも使えます。宿泊施設向けの運用例もあります。",
  },
  {
    q: "デモで作った内容は本番へ引き継げますか？",
    a: "デモは体験用です。実運用は無料登録後のダッシュボードで作成してください。",
  },
  {
    q: "ITに詳しくなくても更新できますか？",
    a: "はい。ブロック追加と文章差し替え中心の設計です。まずは3ページまで無料で試せます。",
  },
  {
    q: "どのプランを選べばいいですか？",
    a: "個人・小規模はFree。ページ数や分析が必要ならPro、チーム運用ならBusinessプランが目安です。",
  },
] as const;
