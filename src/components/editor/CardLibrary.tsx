"use client";

import type { CardType } from "./types";

type CardLibraryProps = {
  onAddCard: (type: CardType) => void;
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

export const CARD_ICONS: Record<CardType, React.ReactNode> = {
  hero: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
};

/** Hero & blocks (Canva-style) */
const HERO_ITEMS: LibraryItem[] = [
  { type: "hero", label: "ヒーロー", description: "大画像＋タイトル" },
  { type: "info", label: "情報", description: "WiFi・構造化情報" },
  { type: "highlight", label: "ハイライト", description: "強調ブロック" },
  { type: "action", label: "アクション", description: "ボタン・CTA" },
];

/** Basic: welcome, stay info, checkout, notices */
const BASIC_ITEMS: LibraryItem[] = [
  { type: "welcome", label: "ウェルカム", description: "ウェルカムメッセージ・ご挨拶" },
  { type: "wifi", label: "WiFi", description: "SSID・パスワード・接続方法" },
  { type: "breakfast", label: "朝食", description: "朝食の時間・会場・メニュー" },
  { type: "checkout", label: "チェックアウト", description: "チェックアウト時刻・手順" },
  { type: "notice", label: "お知らせ", description: "重要なお知らせ・注意事項" },
  { type: "schedule", label: "営業時間", description: "営業時間・スケジュール" },
  { type: "menu", label: "メニュー", description: "メニュー・価格表" },
];

/** Information: nearby, map, FAQ, emergency, parking */
const INFORMATION_ITEMS: LibraryItem[] = [
  { type: "nearby", label: "周辺案内", description: "周辺スポット・観光案内" },
  { type: "map", label: "地図", description: "住所・アクセスマップ" },
  { type: "parking", label: "駐車場", description: "台数・料金・場所" },
  { type: "pageLinks", label: "ページリンク", description: "子ページへのアイコンリンク" },
  { type: "faq", label: "よくある質問", description: "よくある質問と回答" },
  { type: "emergency", label: "緊急連絡先", description: "緊急連絡先・対応方法" },
];

/** Actions: button, taxi */
const ACTIONS_ITEMS: LibraryItem[] = [
  { type: "button", label: "ボタン", description: "予約・問い合わせ・外部リンク" },
  { type: "taxi", label: "タクシー", description: "タクシー手配・連絡先" },
];

/** Media: image, gallery */
const MEDIA_ITEMS: LibraryItem[] = [
  { type: "image", label: "画像", description: "客室や施設の写真" },
  { type: "gallery", label: "ギャラリー", description: "画像ギャラリー" },
];

/** Hospitality: restaurant, spa, laundry */
const HOSPITALITY_ITEMS: LibraryItem[] = [
  { type: "restaurant", label: "レストラン", description: "館内レストランの案内" },
  { type: "spa", label: "スパ・温泉", description: "スパ・大浴場・温泉の案内" },
  { type: "laundry", label: "ランドリー", description: "ランドリー・クリーニング" },
];

/** Layout: text, divider */
const LAYOUT_ITEMS: LibraryItem[] = [
  { type: "text", label: "テキスト", description: "テキスト・見出し" },
  { type: "divider", label: "区切り線", description: "区切り線" },
];

export const LIBRARY_SECTIONS: LibrarySection[] = [
  { id: "hero", title: "ヒーロー・ブロック", items: HERO_ITEMS },
  { id: "basic", title: "基本", items: BASIC_ITEMS },
  { id: "information", title: "情報", items: INFORMATION_ITEMS },
  { id: "actions", title: "アクション", items: ACTIONS_ITEMS },
  { id: "media", title: "メディア", items: MEDIA_ITEMS },
  { id: "hospitality", title: "ホスピタリティ", items: HOSPITALITY_ITEMS },
  { id: "layout", title: "レイアウト", items: LAYOUT_ITEMS },
];

/**
 * Left panel: Card Library. Sections (Basic, Information, Actions, Media, Hospitality)
 * with cards (icon + label + description). Click inserts card into canvas.
 */
export function CardLibrary({ onAddCard }: CardLibraryProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-200/80 px-4 py-4">
        <h2 className="text-sm font-semibold text-slate-700">
          ブロックライブラリ
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          クリックでキャンバスに追加
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-5">
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
                    onClick={() => onAddCard(item.type)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-slate-50 hover:shadow-sm active:bg-slate-100"
                    aria-label={`${item.label}を追加`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      {CARD_ICONS[item.type] ?? CARD_ICONS.text}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {item.label}
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
