import type { CardType, EditorPlanTier } from "@/components/editor/types";
import { getMinimumPlanForCardType } from "@/components/editor/types";
import type { LineIconName } from "@/components/cards/LineIcon";

export type LibraryAudience = "hotel" | "personal";

export type LibraryItem = {
  type: CardType;
  label: string;
  description: string;
};

export type LibrarySection = {
  id: string;
  title: string;
  items: LibraryItem[];
};

export type QuickPreset = {
  id: string;
  label: string;
  /** One-line intent shown under the title. */
  purpose: string;
  types: CardType[];
  icon: LineIconName;
  audience: LibraryAudience;
  businessOnly?: boolean;
  /** When the set includes `info`, use this content instead of the empty default. */
  infoContent?: Record<string, unknown>;
};

export const LIBRARY_AUDIENCE_STORAGE_KEY = "infomii-editor-library-audience";

/** 個人向けライブラリでは非表示（宿泊・施設運用向けブロック） */
export const HOTEL_ONLY_BLOCK_TYPES: CardType[] = [
  "wifi",
  "checkout",
  "breakfast",
  "breakfast_crowd",
  "dinner_crowd",
  "spa_crowd",
  "parking",
  "taxi",
  "restaurant",
  "laundry",
  "spa",
  "open_status",
  "menu",
  "menu_categories",
  "daily_special",
  "drink_menu",
  "combo_set_menu",
  "menu_grid",
  "menu_time_band",
  "campaign_timer",
  "coupon",
];

const PERSONAL_LABEL_OVERRIDES: Partial<Record<CardType, { label: string; description: string }>> = {
  welcome: { label: "ひとこと・挨拶", description: "旅のしおりやイベントの導入メッセージ" },
  schedule: { label: "日程・タイムライン", description: "日付・時刻・予定を並べる" },
  nearby: { label: "行きたい場所", description: "スポットやおすすめをリスト化" },
  highlight: { label: "大事な連絡", description: "遅刻・雨天など注意を目立たせる" },
  notice: { label: "リマインド", description: "必ず読んでほしい連絡事項" },
  map: { label: "地図・集合場所", description: "待ち合わせや会場の住所" },
  steps: { label: "流れ・ステップ", description: "当日の動きを順番に表示" },
  checklist: { label: "持ち物・TODO", description: "持ち物や確認リスト" },
  contact_hub: { label: "連絡先", description: "電話・メール・LINEなど" },
  pageLinks: { label: "リンクまとめ", description: "予約・地図・SNSなどへの導線" },
  hero_slider: { label: "写真スライド", description: "旅行・イベントの写真を切り替え表示" },
  notice_ticker: { label: "お知らせスクロール", description: "当日の連絡を横に流して表示（Pro）" },
  emergency_banner: { label: "緊急連絡バナー", description: "集合変更など最優先の連絡" },
  scheduled_banner: { label: "期間限定のお知らせ", description: "イベント期間だけ表示する告知（Business）" },
};

const MAIN_ITEMS: LibraryItem[] = [
  { type: "hero", label: "ヒーロー", description: "ページ冒頭のタイトルとメイン写真" },
  { type: "hero_slider", label: "ヒーロースライド", description: "複数写真を切替表示" },
  { type: "welcome", label: "ウェルカム", description: "あいさつや導入説明" },
];

/** Layout primitives — freeform after picking structure. */
const LAYOUT_ITEMS: LibraryItem[] = [
  { type: "info", label: "ラベル行リスト", description: "用途を選んで項目名と値を並べる" },
  { type: "heading_body", label: "見出し＋本文", description: "タイトルと本文を自由に書く" },
  { type: "notice", label: "お知らせ", description: "連絡事項を目立たせる" },
  { type: "highlight", label: "強調ブロック", description: "注意・告知を強調する" },
  { type: "text", label: "自由テキスト", description: "見出し・本文を自由入力" },
  { type: "checkout", label: "チェックアウト", description: "退室時刻・補足・詳細リンク" },
];

const GUIDE_ITEMS: LibraryItem[] = [
  { type: "map", label: "地図", description: "アクセス・所在地を表示" },
  { type: "nearby", label: "周辺案内", description: "観光スポットや周辺施設" },
  { type: "schedule", label: "営業時間一覧", description: "施設ごとの時間割を一覧表示（動的強調はBusinessプラン）" },
  { type: "faq", label: "よくある質問", description: "問い合わせを先回りで解消" },
  { type: "accordion_info", label: "アコーディオン案内", description: "折りたたみ式で情報整理" },
  { type: "open_status", label: "営業時間ステータス", description: "営業中/営業時間外を表示" },
  { type: "emergency", label: "緊急連絡先", description: "火災・警察・病院など" },
  { type: "notice_ticker", label: "お知らせティッカー", description: "横スクロールで重要案内を表示（Pro）" },
  { type: "emergency_banner", label: "緊急告知バナー", description: "最優先の注意喚起を表示" },
  { type: "scheduled_banner", label: "期間限定バナー", description: "期間内だけ表示する告知（Business）" },
];

/** Live / now status — hotel ops. */
const LIVE_ITEMS: LibraryItem[] = [
  { type: "breakfast_crowd", label: "朝食混雑", description: "空席・混雑のいま（ライブ）" },
  { type: "dinner_crowd", label: "夕食混雑", description: "レストラン空席・混雑のいま（ライブ）" },
  { type: "spa_crowd", label: "大浴場混雑", description: "大浴場の混雑のいま（ライブ）" },
];

const MENU_ITEMS: LibraryItem[] = [
  { type: "menu", label: "メニュー一覧", description: "一覧（飲食テーマの静的サンプル画像）" },
  { type: "menu_categories", label: "カテゴリ別メニュー", description: "カテゴリ帯もテーマ別の静的サンプル" },
  { type: "daily_special", label: "本日のおすすめ", description: "おすすめ強調（飲食テーマの静的サンプル）" },
  { type: "drink_menu", label: "ドリンクメニュー", description: "サイズ価格・備考（飲料テーマの静的サンプル）" },
  { type: "combo_set_menu", label: "セット・コース", description: "内容・価格（コース向け静的サンプル）" },
  { type: "menu_grid", label: "メニュー表（グリッド）", description: "行・列を自由に編集できるメニュー表" },
  { type: "menu_time_band", label: "時間帯別メニュー", description: "時間帯切替（飲食テーマの静的サンプル・Businessプラン）" },
];

const OPERATION_ITEMS: LibraryItem[] = [
  { type: "button", label: "リンクボタン", description: "予約・外部導線への誘導" },
  { type: "pageLinks", label: "ページリンク", description: "子ページへメニュー遷移" },
  { type: "campaign_timer", label: "キャンペーンタイマー", description: "期間表示とカウントダウン（Pro）" },
  { type: "coupon", label: "クーポン", description: "特典コード・期限・注意事項を表示（Pro）" },
  { type: "social_links", label: "SNSリンク集", description: "SNSの導線を一括表示" },
  { type: "contact_hub", label: "連絡先ハブ", description: "電話/メール/地図リンクを集約" },
];

const COMPARISON_ITEMS: LibraryItem[] = [
  { type: "compare", label: "比較・料金表", description: "2列比較または料金表（最大4列）" },
  { type: "kpi", label: "数字強調", description: "時間・数値情報を強く見せる" },
  { type: "quote", label: "引用", description: "レビュー・口コミ掲載" },
  { type: "checklist", label: "チェックリスト", description: "持ち物・手続き確認" },
  { type: "steps", label: "ステップ", description: "手順を段階的に表示" },
  { type: "progress_steps", label: "進捗ステップ", description: "現在進捗を視覚化" },
  { type: "tabs_info", label: "タブ切替案内", description: "複数案内をタブで切替表示" },
  { type: "faq_search", label: "FAQ検索", description: "よくある質問を一覧表示" },
];

const MEDIA_ITEMS: LibraryItem[] = [
  { type: "image", label: "画像", description: "写真を1枚表示" },
  { type: "video", label: "動画", description: "YouTube・Vimeo・直リンクを埋め込み" },
  { type: "gallery", label: "ギャラリー", description: "複数画像をグリッド表示" },
  { type: "image_tiles", label: "画像タイル", description: "写真＋ラベルの2列グリッド導線" },
  { type: "divider", label: "区切り線", description: "セクションの視覚区切り" },
  { type: "space", label: "スペース", description: "上下の余白を調整" },
];

const BASE_LIBRARY_SECTIONS: LibrarySection[] = [
  { id: "main", title: "メイン表示", items: MAIN_ITEMS },
  { id: "layouts", title: "レイアウト", items: LAYOUT_ITEMS },
  { id: "guide", title: "案内・情報", items: GUIDE_ITEMS },
  { id: "live", title: "ライブ状況", items: LIVE_ITEMS },
  { id: "menu", title: "メニュー", items: MENU_ITEMS },
  { id: "operation", title: "運用・導線", items: OPERATION_ITEMS },
  { id: "comparison", title: "比較・訴求", items: COMPARISON_ITEMS },
  { id: "media", title: "メディア・装飾", items: MEDIA_ITEMS },
];

const PERSONAL_SECTION_TITLES: Partial<Record<string, string>> = {
  main: "メイン表示",
  layouts: "レイアウト",
  guide: "共有・案内",
  operation: "リンク・連絡",
  comparison: "比較・訴求",
  media: "メディア・装飾",
};

export const HOTEL_QUICK_PRESETS: QuickPreset[] = [
  {
    id: "arrival-basic",
    label: "到着セット",
    purpose: "チェックイン直後に必要な案内",
    icon: "key",
    types: ["hero", "welcome", "wifi", "checkout"],
    audience: "hotel",
  },
  {
    id: "breakfast-ops",
    label: "朝食セット",
    purpose: "時間・会場と混雑のいま",
    icon: "breakfast",
    types: ["breakfast", "breakfast_crowd"],
    audience: "hotel",
  },
  {
    id: "inhouse-support",
    label: "館内セット",
    purpose: "フロント・FAQ・緊急連絡",
    icon: "bell",
    types: ["info", "faq", "emergency"],
    audience: "hotel",
    infoContent: {
      title: "フロント・館内",
      icon: "info",
      tone: "slate",
      rows: [
        { label: "フロント", value: "24時間 / 内線9", show: true },
        { label: "製氷機", value: "各フロア廊下", show: true },
        { label: "電子レンジ", value: "2F サービスコーナー", show: true },
      ],
    },
  },
  {
    id: "spa-onsen",
    label: "大浴場セット",
    purpose: "利用案内と混雑ステータス",
    icon: "spa",
    types: ["spa", "spa_crowd"],
    audience: "hotel",
  },
  {
    id: "sightseeing-nearby",
    label: "周辺案内セット",
    purpose: "スポットと移動の導線",
    icon: "nearby",
    types: ["hero", "nearby", "taxi", "map"],
    audience: "hotel",
  },
  {
    id: "hotel-core-hub",
    label: "トップハブセット",
    purpose: "子ページへの入口",
    icon: "link",
    types: ["hero_slider", "pageLinks", "image_tiles"],
    audience: "hotel",
  },
];

export const PERSONAL_QUICK_PRESETS: QuickPreset[] = [
  {
    id: "btoc-travel-basic",
    label: "旅行しおり",
    purpose: "予定・持ち物・集合をまとめて",
    icon: "ticket",
    types: ["hero", "schedule", "checklist", "map", "button"],
    audience: "personal",
  },
  {
    id: "btoc-photo-itinerary",
    label: "フォト旅行セット",
    purpose: "写真スライドと当日の流れ",
    icon: "camera",
    types: ["hero_slider", "schedule", "checklist", "highlight", "map"],
    audience: "personal",
  },
  {
    id: "btoc-oshi-live",
    label: "ライブ当日セット",
    purpose: "集合・持ち物・連絡を共有",
    icon: "gift",
    types: ["hero", "schedule", "checklist", "highlight", "social_links"],
    audience: "personal",
  },
  {
    id: "btoc-outing-date",
    label: "おでかけプラン",
    purpose: "予定と待ち合わせを共有",
    icon: "map-pin",
    types: ["hero", "schedule", "map", "nearby", "button"],
    audience: "personal",
  },
  {
    id: "btoc-link-hub",
    label: "リンク集",
    purpose: "URLとSNSを1ページに",
    icon: "link",
    types: ["hero", "pageLinks", "social_links", "text"],
    audience: "personal",
  },
];

function applyPersonalLabels(item: LibraryItem): LibraryItem {
  const override = PERSONAL_LABEL_OVERRIDES[item.type];
  return override ? { ...item, ...override } : item;
}

/** 個人向け案内セクションの並び（旅のしおり用途を優先） */
const PERSONAL_GUIDE_PRIORITY: CardType[] = [
  "schedule",
  "nearby",
  "map",
  "faq",
  "accordion_info",
  "emergency",
  "notice_ticker",
  "emergency_banner",
  "scheduled_banner",
];

function sortGuideForPersonal(items: LibraryItem[]): LibraryItem[] {
  const rank = (type: CardType) => {
    const i = PERSONAL_GUIDE_PRIORITY.indexOf(type);
    return i === -1 ? 100 : i;
  };
  return [...items].sort((a, b) => rank(a.type) - rank(b.type));
}

export function getLibrarySections(audience: LibraryAudience): LibrarySection[] {
  return BASE_LIBRARY_SECTIONS.map((section) => {
    let items = section.items.filter(
      (item) => audience === "hotel" || !HOTEL_ONLY_BLOCK_TYPES.includes(item.type),
    );
    if (audience === "personal") {
      items = items.map(applyPersonalLabels);
      if (section.id === "guide") {
        items = sortGuideForPersonal(items);
      }
    }
    const title = audience === "personal" ? (PERSONAL_SECTION_TITLES[section.id] ?? section.title) : section.title;
    return { ...section, title, items };
  }).filter((section) => section.items.length > 0);
}

export function getQuickPresets(audience: LibraryAudience): QuickPreset[] {
  return audience === "hotel" ? HOTEL_QUICK_PRESETS : PERSONAL_QUICK_PRESETS;
}

export function flattenLibraryItems(audience: LibraryAudience): { type: CardType; label: string; category: string }[] {
  const out: { type: CardType; label: string; category: string }[] = [];
  for (const section of getLibrarySections(audience)) {
    for (const item of section.items) {
      out.push({ type: item.type, label: item.label, category: section.title });
    }
  }
  return out;
}

const HOTEL_SIGNAL_TYPES: CardType[] = [
  "wifi",
  "checkout",
  "laundry",
  "spa",
  "parking",
  "open_status",
  "breakfast",
  "breakfast_crowd",
  "dinner_crowd",
  "spa_crowd",
  "taxi",
  "restaurant",
  "menu",
  "menu_categories",
];

const PERSONAL_SIGNAL_TYPES: CardType[] = [
  "checklist",
  "steps",
  "social_links",
  "tabs_info",
  "progress_steps",
];

export function inferLibraryAudience(cards: { type: string }[]): LibraryAudience {
  let hotel = 0;
  let personal = 0;
  for (const card of cards) {
    const type = card.type as CardType;
    if (HOTEL_SIGNAL_TYPES.includes(type)) hotel += 2;
    if (PERSONAL_SIGNAL_TYPES.includes(type)) personal += 2;
    if (type === "schedule") personal += 1;
  }
  if (hotel === 0 && personal === 0) {
    return readStoredLibraryAudience() ?? "personal";
  }
  return personal >= hotel ? "personal" : "hotel";
}

/** App shell: infer from page content, else last stored choice, else personal. */
export function resolveAppLibraryAudience(cards: { type: string }[]): LibraryAudience {
  if (cards.length > 0) return inferLibraryAudience(cards);
  return readStoredLibraryAudience() ?? "personal";
}

export const HOTEL_STARTER_CARD_TYPES: CardType[] = [
  "hero",
  "info",
  "highlight",
  "checkout",
  "nearby",
];

export const PERSONAL_STARTER_CARD_TYPES: CardType[] = [
  "hero",
  "welcome",
  "schedule",
  "highlight",
  "checklist",
];

export function getStarterCardTypes(audience: LibraryAudience): CardType[] {
  return audience === "personal" ? PERSONAL_STARTER_CARD_TYPES : HOTEL_STARTER_CARD_TYPES;
}

export function readStoredLibraryAudience(): LibraryAudience | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(LIBRARY_AUDIENCE_STORAGE_KEY);
    return v === "personal" || v === "hotel" ? v : null;
  } catch {
    return null;
  }
}

export function persistLibraryAudience(audience: LibraryAudience): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LIBRARY_AUDIENCE_STORAGE_KEY, audience);
  } catch {
    /* ignore */
  }
}

export function getPresetMinimumPlan(types: CardType[]): EditorPlanTier {
  let highest: EditorPlanTier = "free";
  for (const type of types) {
    const minimum = getMinimumPlanForCardType(type);
    if (minimum === "business") return "business";
    if (minimum === "pro") highest = "pro";
  }
  return highest;
}

/** @deprecated SlashCommandMenu 互換 — 宿泊施設向け一覧 */
export const LIBRARY_SECTIONS_HOTEL = getLibrarySections("hotel");
