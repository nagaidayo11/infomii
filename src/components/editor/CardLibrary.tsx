"use client";

import { BUSINESS_ONLY_CARD_TYPES, type CardType } from "./types";

type CardLibraryProps = {
  onAddCard: (type: CardType) => void;
  onAddPreset?: (types: CardType[]) => void;
  canUseBusinessBlocks?: boolean;
  onLockedAddCard?: (type: CardType) => void;
};

type LibraryItem = {
  type: CardType;
  label: string;
  description: string;
};

type LibrarySection = {
  id: string;
  title: string;
  items: LibraryItem[];
};

type QuickPreset = {
  id: string;
  label: string;
  description: string;
  purpose: string;
  types: CardType[];
  businessOnly?: boolean;
};

function BusinessBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4 18h16l-1.4-8.3a1 1 0 0 0-1.66-.58L13.7 12.1a1 1 0 0 1-1.4 0L7.06 9.12a1 1 0 0 0-1.66.58L4 18zm3.2-11.5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zm9.6 0a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM12 8.1A1.9 1.9 0 1 0 12 4.3a1.9 1.9 0 0 0 0 3.8z" />
      </svg>
      Business
    </span>
  );
}

export const CARD_ICONS: Record<CardType, React.ReactNode> = {
  hero: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  hero_slider: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M8 15h6M6.5 12l-1.5 1.5L6.5 15m11-3 1.5 1.5-1.5 1.5" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  highlight: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  action: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  welcome: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  wifi: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  breakfast: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  checkout: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  notice: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  nearby: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  map: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  button: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  image: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  gallery: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={2} />
    </svg>
  ),
  faq: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  emergency: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  laundry: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  taxi: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  restaurant: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  spa: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  text: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  icon: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4m0 4h.01" />
    </svg>
  ),
  schedule: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  menu: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  divider: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
    </svg>
  ),
  space: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 16h14M8 12h8" />
    </svg>
  ),
  parking: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  pageLinks: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  quote: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8H6v4h3v4H5v-4c0-2.2 1.8-4 4-4zM19 8h-3v4h3v4h-4v-4c0-2.2 1.8-4 4-4z" />
    </svg>
  ),
  checklist: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h11M4 12h11M4 17h11m3-10 1.5 1.5L22 6m-4 6 1.5 1.5L22 11m-4 6 1.5 1.5L22 16" />
    </svg>
  ),
  steps: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="6" cy="6" r="2" strokeWidth={2} />
      <circle cx="18" cy="12" r="2" strokeWidth={2} />
      <circle cx="6" cy="18" r="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7.2 16 10.8M16 13.2 8 16.8" />
    </svg>
  ),
  compare: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="8" height="14" rx="1.5" strokeWidth={2} />
      <rect x="13" y="5" width="8" height="14" rx="1.5" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 9h.01M17 9h.01" />
    </svg>
  ),
  kpi: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 18h16" />
      <rect x="6" y="11" width="3" height="5" rx=".6" strokeWidth={2} />
      <rect x="11" y="8" width="3" height="8" rx=".6" strokeWidth={2} />
      <rect x="16" y="5" width="3" height="11" rx=".6" strokeWidth={2} />
    </svg>
  ),
  campaign_timer: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="13" r="7" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4l2 2M9 3h6" />
    </svg>
  ),
  tabs_info: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 9h3m4 0h3M7 13h10" />
    </svg>
  ),
  faq_search: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m20 20-3.5-3.5" />
    </svg>
  ),
  notice_ticker: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11h14m0 0-3-3m3 3-3 3M3 6h18M3 18h18" />
    </svg>
  ),
  coupon: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 1 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 1 0 0-4V9z" />
    </svg>
  ),
};

const MAIN_ITEMS: LibraryItem[] = [
  { type: "hero", label: "ヒーロー", description: "ページ冒頭のタイトルとメイン写真" },
  { type: "hero_slider", label: "ヒーロースライド", description: "複数写真を切替表示（Business限定）" },
  { type: "highlight", label: "強調ブロック", description: "注意事項や告知を目立たせる" },
  { type: "notice", label: "重要なお知らせ", description: "必ず読んでほしい連絡事項" },
];

const GUIDE_ITEMS: LibraryItem[] = [
  { type: "welcome", label: "ウェルカム", description: "あいさつや導入説明" },
  { type: "wifi", label: "WiFi案内", description: "SSID・パスワードを掲載" },
  { type: "checkout", label: "チェックアウト", description: "退室時刻や手順を案内" },
  { type: "breakfast", label: "施設案内（汎用）", description: "時間・場所・詳細をまとめる" },
  { type: "schedule", label: "営業時間一覧", description: "施設ごとの営業時間を一覧表示" },
  { type: "menu", label: "メニュー一覧", description: "メニュー名・価格・説明を表示" },
  { type: "faq", label: "よくある質問", description: "問い合わせを先回りで解消" },
  { type: "emergency", label: "緊急連絡先", description: "火災・警察・病院など" },
];

const OPERATION_ITEMS: LibraryItem[] = [
  { type: "button", label: "リンクボタン", description: "予約・外部導線への誘導" },
  { type: "pageLinks", label: "ページリンク", description: "子ページへメニュー遷移" },
  { type: "map", label: "地図", description: "アクセス・所在地を表示" },
  { type: "nearby", label: "周辺案内", description: "観光スポットや周辺施設" },
  { type: "parking", label: "駐車場案内", description: "台数・料金・場所を案内" },
  { type: "taxi", label: "タクシー案内", description: "連絡先と備考を掲載" },
];

const COMPARISON_ITEMS: LibraryItem[] = [
  { type: "compare", label: "比較", description: "2列で内容を比較表示" },
  { type: "kpi", label: "数字強調", description: "時間・数値情報を強く見せる" },
  { type: "quote", label: "引用", description: "レビュー・口コミ掲載" },
  { type: "checklist", label: "チェックリスト", description: "持ち物・手続き確認" },
  { type: "steps", label: "ステップ", description: "手順を段階的に表示" },
  { type: "tabs_info", label: "タブ切替案内", description: "複数案内をタブで切替表示" },
  { type: "faq_search", label: "FAQ検索", description: "FAQをキーワードで絞り込み" },
];

const MEDIA_ITEMS: LibraryItem[] = [
  { type: "image", label: "画像", description: "写真を1枚表示" },
  { type: "gallery", label: "ギャラリー", description: "複数画像をグリッド表示" },
  { type: "text", label: "自由テキスト", description: "見出し・本文を自由入力" },
  { type: "restaurant", label: "レストラン案内", description: "営業時間・場所・内容を表示" },
  { type: "laundry", label: "ランドリー案内", description: "営業時間・料金・連絡先" },
  { type: "spa", label: "スパ・温泉案内", description: "時間・場所・案内を表示" },
  { type: "divider", label: "区切り線", description: "セクションの視覚区切り" },
  { type: "space", label: "スペース", description: "上下の余白を調整" },
];

const BUSINESS_ITEMS: LibraryItem[] = [
  { type: "hero_slider", label: "ヒーロースライド", description: "動的な複数写真ヒーロー" },
  { type: "campaign_timer", label: "キャンペーンタイマー", description: "期間表示とカウントダウン" },
  { type: "notice_ticker", label: "お知らせティッカー", description: "横スクロールで重要案内を表示" },
  { type: "coupon", label: "クーポン", description: "特典コード・期限・注意事項を表示" },
];

export const LIBRARY_SECTIONS: LibrarySection[] = [
  { id: "main", title: "メイン表示", items: MAIN_ITEMS },
  { id: "guide", title: "案内・情報", items: GUIDE_ITEMS },
  { id: "operation", title: "運用・導線", items: OPERATION_ITEMS },
  { id: "comparison", title: "比較・訴求", items: COMPARISON_ITEMS },
  { id: "media", title: "メディア・装飾", items: MEDIA_ITEMS },
  { id: "business", title: "Business限定", items: BUSINESS_ITEMS },
];

const QUICK_PRESETS: QuickPreset[] = [
  {
    id: "checkin-basic",
    label: "チェックイン基本セット",
    purpose: "初回案内を最短で公開",
    description: "ヒーロー / ウェルカム / WiFi案内 / チェックアウト / リンクボタン",
    types: ["hero", "welcome", "wifi", "checkout", "button"],
  },
  {
    id: "facility-standard",
    label: "館内案内スタンダード",
    purpose: "館内情報を1ページで網羅",
    description: "ヒーロー / 施設案内 / 営業時間一覧 / よくある質問 / 地図",
    types: ["hero", "breakfast", "schedule", "faq", "map"],
  },
  {
    id: "sightseeing-nearby",
    label: "観光・周辺案内セット",
    purpose: "移動と周辺導線を明確化",
    description: "ヒーロー / 周辺案内 / ページリンク / タクシー案内 / 地図",
    types: ["hero", "nearby", "pageLinks", "taxi", "map"],
  },
  {
    id: "multilingual-ops",
    label: "多言語運用セット（Business）",
    purpose: "多言語前提の運用導線を構築",
    description: "ヒーロースライド / 重要なお知らせ / WiFi案内 / よくある質問 / リンクボタン",
    types: ["hero_slider", "notice", "wifi", "faq", "button"],
    businessOnly: true,
  },
  {
    id: "campaign-conversion",
    label: "キャンペーン訴求セット（Business）",
    purpose: "期間訴求とCV導線を強化",
    description: "ヒーロースライド / キャンペーンタイマー / 強調ブロック / 比較 / リンクボタン",
    types: ["hero_slider", "campaign_timer", "highlight", "compare", "button"],
    businessOnly: true,
  },
];

/**
 * Left panel: Card Library — grouped by purpose (main view, guides, safety, access, trust, layout).
 * Click inserts a card into the canvas.
 */
export function CardLibrary({
  onAddCard,
  onAddPreset,
  canUseBusinessBlocks = false,
  onLockedAddCard,
}: CardLibraryProps) {
  const canAdd = (type: CardType) => canUseBusinessBlocks || !BUSINESS_ONLY_CARD_TYPES.includes(type);
  const canAddPreset = (types: CardType[]) => types.every((type) => canAdd(type));
  const handleAdd = (type: CardType) => {
    if (!canAdd(type)) {
      onLockedAddCard?.(type);
      return;
    }
    onAddCard(type);
  };
  const handleAddPreset = (preset: QuickPreset) => {
    if (!canAddPreset(preset.types)) {
      const locked = preset.types.find((type) => !canAdd(type));
      if (locked) onLockedAddCard?.(locked);
      return;
    }
    onAddPreset?.(preset.types);
  };
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-200/80 px-3 py-3">
        <h2 className="text-sm font-semibold text-slate-700">
          ブロックライブラリ
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          クリックでキャンバスに追加
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-3">
          {onAddPreset && (
            <section aria-label="おすすめセット" className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                おすすめセット
              </h3>
              <div className="space-y-1">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className={
                      "w-full rounded-xl border px-2.5 py-2 text-left transition-all " +
                      (canAddPreset(preset.types)
                        ? "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        : "border-violet-300 bg-violet-50/70")
                    }
                    aria-label={`${preset.label}を追加`}
                    title={canAddPreset(preset.types) ? undefined : "Businessプランで利用できます"}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                      {preset.label}
                      {preset.businessOnly ? (
                        <BusinessBadge />
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-600">{preset.purpose}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">{preset.description}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
          {LIBRARY_SECTIONS.map((section) => (
            <section
              key={section.id}
              aria-label={section.title}
              className="space-y-2"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={`${section.id}-${item.type}`}
                    type="button"
                    onClick={() => handleAdd(item.type)}
                    className={
                      "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all " +
                      (canAdd(item.type)
                        ? "hover:bg-slate-50 hover:shadow-sm active:bg-slate-100"
                        : "cursor-not-allowed opacity-55")
                    }
                    aria-label={`${item.label}を追加`}
                    title={canAdd(item.type) ? undefined : "Businessプラン限定ブロックです"}
                  >
                    <span
                      className={
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.8] [&_svg_*]:stroke-linecap-round [&_svg_*]:stroke-linejoin-round " +
                        (!canAdd(item.type)
                          ? "border border-violet-300 bg-violet-100 text-violet-700"
                          : "bg-slate-100")
                      }
                    >
                      {CARD_ICONS[item.type] ?? CARD_ICONS.text}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 truncate text-sm font-medium text-slate-800">
                        <span className="truncate">{item.label}</span>
                        {!canAdd(item.type) ? (
                          <BusinessBadge />
                        ) : null}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {item.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
