import type { CardType, EditorPlanTier } from "@/components/editor/types";
import { getMinimumPlanForCardType } from "@/components/editor/types";

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
  description: string;
  purpose: string;
  types: CardType[];
  audience: LibraryAudience;
  businessOnly?: boolean;
};

export const LIBRARY_AUDIENCE_STORAGE_KEY = "infomii-editor-library-audience";

/** 個人向けライブラリでは非表示（宿泊・施設運用向けブロック） */
export const HOTEL_ONLY_BLOCK_TYPES: CardType[] = [
  "wifi",
  "checkout",
  "breakfast",
  "breakfast_crowd",
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
  "salon_service_menu",
  "combo_set_menu",
  "menu_grid",
  "menu_time_band",
  "menu_sheet_sync",
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
  menu_sheet_sync: { label: "メニュー（表連携）", description: "スプレッドシートからメニュー更新（Business）" },
};

const MAIN_ITEMS: LibraryItem[] = [
  { type: "hero", label: "ヒーロー", description: "ページ冒頭のタイトルとメイン写真" },
  { type: "hero_slider", label: "ヒーロースライド", description: "複数写真を切替表示" },
  { type: "heading_body", label: "見出し＋本文セット", description: "見出しと本文を上下で表示" },
  { type: "highlight", label: "強調ブロック", description: "注意事項や告知を目立たせる" },
  { type: "notice", label: "重要なお知らせ", description: "必ず読んでほしい連絡事項" },
];

const GUIDE_ITEMS: LibraryItem[] = [
  { type: "welcome", label: "ウェルカム", description: "あいさつや導入説明" },
  { type: "wifi", label: "WiFi案内", description: "SSID・パスワードを掲載" },
  { type: "checkout", label: "チェックアウト", description: "退室時刻や手順を案内" },
  { type: "breakfast", label: "施設案内（汎用）", description: "時間・場所・詳細をまとめる" },
  { type: "breakfast_crowd", label: "朝食混雑", description: "空席・混雑のいま" },
  { type: "map", label: "地図", description: "アクセス・所在地を表示" },
  { type: "nearby", label: "周辺案内", description: "観光スポットや周辺施設" },
  { type: "parking", label: "駐車場案内", description: "台数・料金・場所を案内" },
  { type: "taxi", label: "タクシー案内", description: "連絡先と備考を掲載" },
  { type: "restaurant", label: "レストラン案内", description: "営業時間・場所・内容を表示" },
  { type: "laundry", label: "ランドリー案内", description: "営業時間・料金・連絡先" },
  { type: "spa", label: "スパ・温泉案内", description: "時間・場所・案内を表示" },
  { type: "schedule", label: "営業時間一覧", description: "施設ごとの時間割を一覧表示（動的強調はBusinessプラン）" },
  { type: "menu", label: "メニュー一覧", description: "一覧（飲食テーマの静的サンプル画像）" },
  { type: "menu_categories", label: "カテゴリ別メニュー", description: "カテゴリ帯もテーマ別の静的サンプル" },
  { type: "daily_special", label: "本日のおすすめ", description: "おすすめ強調（飲食テーマの静的サンプル）" },
  { type: "drink_menu", label: "ドリンクメニュー", description: "サイズ価格・備考（飲料テーマの静的サンプル）" },
  { type: "combo_set_menu", label: "セット・コース", description: "内容・価格（コース向け静的サンプル）" },
  { type: "menu_grid", label: "メニュー表（グリッド）", description: "行・列を自由に編集できるメニュー表" },
  { type: "menu_time_band", label: "時間帯別メニュー", description: "時間帯切替（飲食テーマの静的サンプル・Businessプラン）" },
  { type: "faq", label: "よくある質問", description: "問い合わせを先回りで解消" },
  { type: "notice_ticker", label: "お知らせティッカー", description: "横スクロールで重要案内を表示（Pro）" },
  { type: "emergency_banner", label: "緊急告知バナー", description: "最優先の注意喚起を表示" },
  { type: "scheduled_banner", label: "期間限定バナー", description: "期間内だけ表示する告知（Business）" },
  { type: "accordion_info", label: "アコーディオン案内", description: "折りたたみ式で情報整理" },
  { type: "open_status", label: "営業時間ステータス", description: "営業中/営業時間外を表示" },
  { type: "emergency", label: "緊急連絡先", description: "火災・警察・病院など" },
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
  { type: "text", label: "自由テキスト", description: "見出し・本文を自由入力" },
  { type: "divider", label: "区切り線", description: "セクションの視覚区切り" },
  { type: "space", label: "スペース", description: "上下の余白を調整" },
];

const BASE_LIBRARY_SECTIONS: LibrarySection[] = [
  { id: "main", title: "メイン表示", items: MAIN_ITEMS },
  { id: "guide", title: "案内・情報", items: GUIDE_ITEMS },
  { id: "operation", title: "運用・導線", items: OPERATION_ITEMS },
  { id: "comparison", title: "比較・訴求", items: COMPARISON_ITEMS },
  { id: "media", title: "メディア・装飾", items: MEDIA_ITEMS },
];

const PERSONAL_SECTION_TITLES: Partial<Record<string, string>> = {
  guide: "共有・案内",
  operation: "リンク・連絡",
};

export const HOTEL_QUICK_PRESETS: QuickPreset[] = [
  {
    id: "checkin-basic",
    label: "チェックイン基本セット",
    purpose: "初回案内を最短で公開",
    description: "ヒーロー / ウェルカム / WiFi案内 / チェックアウト / リンクボタン",
    types: ["hero", "welcome", "wifi", "checkout", "button"],
    audience: "hotel",
  },
  {
    id: "facility-standard",
    label: "館内案内スタンダード",
    purpose: "館内情報を1ページで網羅",
    description: "ヒーロー / 施設案内 / 営業時間ステータス / アコーディオン案内 / 地図",
    types: ["hero", "breakfast", "open_status", "accordion_info", "map"],
    audience: "hotel",
  },
  {
    id: "sightseeing-nearby",
    label: "観光・周辺案内セット",
    purpose: "移動と周辺導線を明確化",
    description: "ヒーロー / 周辺案内 / ページリンク / タクシー案内 / 地図",
    types: ["hero", "nearby", "pageLinks", "taxi", "map"],
    audience: "hotel",
  },
  {
    id: "multilingual-ops",
    label: "多言語運用セット",
    purpose: "ゲスト案内の基本導線を構築",
    description: "ヒーロースライド / 重要なお知らせ / WiFi案内 / よくある質問 / リンクボタン",
    types: ["hero_slider", "notice", "wifi", "faq", "button"],
    audience: "hotel",
  },
  {
    id: "campaign-conversion",
    label: "キャンペーン訴求セット",
    purpose: "期間訴求とCV導線を強化",
    description: "ヒーロースライド / キャンペーンタイマー / 強調ブロック / 比較 / リンクボタン",
    types: ["hero_slider", "campaign_timer", "highlight", "compare", "button"],
    audience: "hotel",
  },
  {
    id: "core-guide-hub",
    label: "コアガイド・トップハブ",
    purpose: "Core Guide型のゲスト入口を最短構築",
    description: "ヒーロースライド / ページリンク / 画像タイル",
    types: ["hero_slider", "pageLinks", "image_tiles"],
    audience: "hotel",
  },
];

export const PERSONAL_QUICK_PRESETS: QuickPreset[] = [
  {
    id: "btoc-travel-basic",
    label: "旅行しおり・基本セット",
    purpose: "友達に送る旅のしおりを最短で",
    description: "タイトル / 今日の予定 / 持ち物 / 集合場所 / 予約リンク",
    types: ["hero", "schedule", "checklist", "map", "button"],
    audience: "personal",
  },
  {
    id: "btoc-photo-itinerary",
    label: "思い出フォト・旅行セット",
    purpose: "写真スライドと予定を1ページに",
    description: "写真スライド / 今日の予定 / 持ち物 / 大事な連絡 / 集合場所",
    types: ["hero_slider", "schedule", "checklist", "highlight", "map"],
    audience: "personal",
  },
  {
    id: "btoc-oshi-live",
    label: "推し活・ライブ当日セット",
    purpose: "ライブ当日の集合・持ち物を共有",
    description: "タイトル / タイムライン / 持ち物 / 大事な連絡 / SNS",
    types: ["hero", "schedule", "checklist", "highlight", "social_links"],
    audience: "personal",
  },
  {
    id: "btoc-outing-date",
    label: "おでかけ・デートプラン",
    purpose: "今日の予定を相手に共有",
    description: "タイトル / タイムライン / 待ち合わせ / 行きたい場所 / リンク",
    types: ["hero", "schedule", "map", "nearby", "button"],
    audience: "personal",
  },
  {
    id: "btoc-link-hub",
    label: "リンク集・プロフィール",
    purpose: "URLを1ページにまとめる",
    description: "タイトル / リンクまとめ / SNS / 自由メモ",
    types: ["hero", "pageLinks", "social_links", "text"],
    audience: "personal",
  },
];

function applyPersonalLabels(item: LibraryItem): LibraryItem {
  const override = PERSONAL_LABEL_OVERRIDES[item.type];
  return override ? { ...item, ...override } : item;
}

/** 個人向けでは宿泊専用ブロックを上に並べる */
const PERSONAL_GUIDE_PRIORITY: CardType[] = [
  "welcome",
  "schedule",
  "steps",
  "checklist",
  "nearby",
  "map",
  "highlight",
  "notice",
  "faq",
  "accordion_info",
  "emergency",
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
  if (hotel === 0 && personal === 0) return "hotel";
  return personal >= hotel ? "personal" : "hotel";
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
