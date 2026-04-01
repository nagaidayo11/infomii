"use client";

import type { CardType } from "./types";

type CardLibraryProps = {
  onAddCard: (type: CardType) => void;
  onAddPreset?: (types: CardType[]) => void;
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
};

/** ファーストビュー・目立たせたい内容 */
const PROMOTION_ITEMS: LibraryItem[] = [
  { type: "hero", label: "ヒーロー", description: "ページ先頭の大きな見出しと写真（1ページ1つ推奨）" },
  { type: "highlight", label: "強調ブロック", description: "注意事項やお知らせを目立たせる" },
  { type: "button", label: "リンクボタン", description: "予約サイトやお問い合わせへつなぐ" },
];

/** 館内サービス・宿泊に関する案内 */
const GUIDE_ITEMS: LibraryItem[] = [
  { type: "welcome", label: "ウェルカム", description: "あいさつやページの使い方" },
  { type: "wifi", label: "WiFi案内", description: "SSIDとパスワードをまとめる" },
  { type: "checkout", label: "チェックアウト", description: "退室時刻や手順" },
  { type: "breakfast", label: "施設案内（汎用）", description: "時間・場所・内容を1ブロックで" },
  { type: "schedule", label: "営業時間一覧", description: "施設ごとの営業時間を一覧で" },
  { type: "menu", label: "メニュー一覧", description: "メニュー名・価格・説明" },
  { type: "notice", label: "重要なお知らせ", description: "必ず読んでもらいたい連絡事項" },
  { type: "faq", label: "よくある質問", description: "よくある問い合わせと回答" },
];

/** 緊急時の連絡先 */
const SAFETY_ITEMS: LibraryItem[] = [
  { type: "emergency", label: "緊急連絡先", description: "火災・警察・病院などの番号をまとめる" },
];

/** アクセス・周辺・別ページへのリンク */
const NAV_ITEMS: LibraryItem[] = [
  { type: "pageLinks", label: "ページリンク", description: "子ページへのメニュー（アイコン付き）" },
  { type: "map", label: "地図", description: "住所や地図の埋め込み" },
  { type: "nearby", label: "周辺案内", description: "周辺のスポットや施設" },
  { type: "parking", label: "駐車場案内", description: "台数・料金・場所" },
  { type: "taxi", label: "タクシー案内", description: "タクシー会社の電話番号など" },
];

/** 比較・数値・口コミ */
const TRUST_ITEMS: LibraryItem[] = [
  { type: "compare", label: "比較", description: "2つの内容を並べて比較" },
  { type: "kpi", label: "数字強調", description: "チェックイン時刻など数字を強調" },
  { type: "quote", label: "引用", description: "お客様の声やレビュー" },
];

/** レストラン・温泉など施設タイプ別 */
const INDUSTRY_ITEMS: LibraryItem[] = [
  { type: "restaurant", label: "レストラン案内", description: "館内レストランの案内" },
  { type: "laundry", label: "ランドリー案内", description: "コインランドリーなど" },
  { type: "spa", label: "スパ・温泉案内", description: "大浴場・スパの案内" },
];

/** 写真・テキスト・余白などレイアウト用 */
const LAYOUT_ITEMS: LibraryItem[] = [
  { type: "image", label: "画像", description: "写真を1枚はめ込む" },
  { type: "gallery", label: "ギャラリー", description: "複数枚をグリッド表示" },
  { type: "text", label: "自由テキスト", description: "見出しと本文を自由に" },
  { type: "checklist", label: "チェックリスト", description: "持ち物・手続きの確認" },
  { type: "steps", label: "ステップ", description: "手順を番号付きで表示" },
  { type: "divider", label: "区切り線", description: "ブロック同士の区切り" },
  { type: "space", label: "スペース", description: "上下の余白を空ける" },
];

export const LIBRARY_SECTIONS: LibrarySection[] = [
  { id: "promotion", title: "メイン表示・誘導", items: PROMOTION_ITEMS },
  { id: "guide", title: "館内案内・サービス", items: GUIDE_ITEMS },
  { id: "safety", title: "緊急・安全", items: SAFETY_ITEMS },
  { id: "nav", title: "アクセス・周辺・リンク", items: NAV_ITEMS },
  { id: "trust", title: "比較・実績・口コミ", items: TRUST_ITEMS },
  { id: "industry", title: "施設タイプ別（任意）", items: INDUSTRY_ITEMS },
  { id: "layout", title: "写真・余白・装飾", items: LAYOUT_ITEMS },
];

const QUICK_PRESETS: Array<{ id: string; label: string; description: string; types: CardType[] }> = [
  {
    id: "checkin-basic",
    label: "ホテル基本セット",
    description: "ヒーロー / ウェルカム / WiFi案内 / チェックアウト / FAQ",
    types: ["hero", "welcome", "wifi", "checkout", "faq"],
  },
  {
    id: "frontdesk-reduction",
    label: "フロント時短セット",
    description: "ヒーロー / お知らせ / ページリンク / FAQ / 緊急連絡先",
    types: ["hero", "notice", "pageLinks", "faq", "emergency"],
  },
  {
    id: "facility-guide-complete",
    label: "館内施設セット",
    description: "ヒーロー / 施設案内 / 営業時間一覧 / メニュー一覧 / 地図",
    types: ["hero", "breakfast", "schedule", "menu", "map"],
  },
  {
    id: "promo-conversion",
    label: "強調・比較・数字セット",
    description: "ヒーロー / 強調 / 比較 / 数字強調 / 引用 / ボタン",
    types: ["hero", "highlight", "compare", "kpi", "quote", "button"],
  },
  {
    id: "resort-experience",
    label: "旅館・ギャラリー・周辺セット",
    description: "ヒーロー / ギャラリー / スパ / レストラン / 周辺案内 / 地図",
    types: ["hero", "gallery", "spa", "restaurant", "nearby", "map"],
  },
];

/**
 * Left panel: Card Library — grouped by purpose (main view, guides, safety, access, trust, layout).
 * Click inserts a card into the canvas.
 */
export function CardLibrary({ onAddCard, onAddPreset }: CardLibraryProps) {
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
                    onClick={() => onAddPreset(preset.types)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-left transition-all hover:border-slate-300 hover:bg-slate-50"
                    aria-label={`${preset.label}を追加`}
                  >
                    <span className="block text-sm font-medium text-slate-800">{preset.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{preset.description}</span>
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
                    onClick={() => onAddCard(item.type)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all hover:bg-slate-50 hover:shadow-sm active:bg-slate-100"
                    aria-label={`${item.label}を追加`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.8] [&_svg_*]:stroke-linecap-round [&_svg_*]:stroke-linejoin-round">
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
