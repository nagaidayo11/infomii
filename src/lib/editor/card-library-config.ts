import type { CardType, EditorPlanTier } from "@/components/editor/types";
import { CARD_TYPE_LABELS, getMinimumPlanForCardType } from "@/components/editor/types";
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
  map: { label: "地図・集合場所", description: "待ち合わせや会場の住所と周辺ピン" },
  steps: { label: "流れ・ステップ", description: "当日の動きを順番に表示" },
  checklist: { label: "持ち物・TODO", description: "持ち物や確認リスト" },
  contact_hub: { label: "連絡先", description: "電話・メール・LINEなど" },
  pageLinks: { label: "リンクまとめ", description: "予約・地図・SNSなどへの導線" },
  iconAccordion: { label: "アイコン案内", description: "押すと説明が開くアイコン一覧" },
  storyBand: { label: "写真ストーリー", description: "大きな写真と短いコピー" },
  dayTimeline: { label: "一日の流れ", description: "時刻つきで予定を縦に見せる" },
  scrollCards: { label: "おすすめカード（旧）", description: "既存ページ用" },
  sectionTitle: { label: "区切り見出し", description: "セクションの大きな見出し" },
  photoCompare: { label: "写真で比較", description: "2枚の写真を並べて見せる" },
  image_tiles: { label: "写真ギャラリー", description: "写真グリッド。ラベル表示切替・タップでリンク可" },
  hero: { label: "トップ写真＋タイトル", description: "しおりやイベントの冒頭写真と見出し" },
  hero_slider: { label: "写真スライド", description: "旅行・イベントの写真を切り替え表示" },
  notice_ticker: { label: "流れるお知らせ", description: "当日の連絡を横に流して表示（Pro）" },
  emergency_banner: { label: "緊急の連絡", description: "集合変更など最優先の連絡" },
  scheduled_banner: { label: "期間限定のお知らせ", description: "イベント期間だけ表示する告知（Business）" },
  quote: { label: "ひとこと引用", description: "印象に残った言葉や口コミ" },
  open_status: { label: "開店・開催中か", description: "いま利用できるかを表示" },
};

const MAIN_ITEMS: LibraryItem[] = [
  { type: "hero", label: "トップ写真＋タイトル", description: "ページ冒頭の大きな写真と見出し" },
  { type: "hero_slider", label: "写真スライド", description: "複数の写真を切り替えて表示" },
  { type: "welcome", label: "あいさつ文", description: "歓迎のメッセージや導入説明" },
];

/** Layout primitives — structure that changes how content is presented. */
const LAYOUT_ITEMS: LibraryItem[] = [
  { type: "tabs_info", label: "タブで切替", description: "写真と本文をタブで切り替える" },
  { type: "info", label: "項目リスト", description: "項目名と内容を行で並べる（Wi-Fiなど）" },
  { type: "heading_body", label: "見出し＋本文", description: "タイトルと本文を書く" },
  { type: "notice", label: "お知らせ枠", description: "連絡事項を枠で目立たせる" },
  { type: "highlight", label: "注意・重要枠", description: "注意や告知を強く目立たせる" },
  { type: "text", label: "自由テキスト", description: "好きな文章を自由に書く" },
  { type: "sectionTitle", label: "区切り見出し", description: "セクションを区切る大きな見出し" },
  { type: "checkout", label: "チェックアウト案内", description: "退室時刻・補足・詳細リンク" },
];

const GUIDE_ITEMS: LibraryItem[] = [
  { type: "map", label: "地図", description: "地図と周辺スポットを表示" },
  { type: "nearby", label: "周辺のおすすめ", description: "観光スポットや周辺施設のリスト" },
  { type: "schedule", label: "営業時間一覧", description: "施設ごとの時間を一覧表示" },
  { type: "faq", label: "よくある質問", description: "問い合わせを先回りで解消" },
  { type: "accordion_info", label: "折りたたみ案内", description: "タップで開くQ&A・説明" },
  { type: "open_status", label: "営業中かどうか", description: "いま営業中か時間外かを表示" },
  { type: "emergency", label: "緊急連絡先", description: "火災・警察・病院など" },
  { type: "notice_ticker", label: "流れるお知らせ", description: "横に流れる重要案内（Pro）" },
  { type: "emergency_banner", label: "緊急のお知らせ", description: "最優先の注意を大きく表示" },
  { type: "scheduled_banner", label: "期間限定のお知らせ", description: "決めた期間だけ表示する告知（Business）" },
];

/** Live / now status — hotel ops. */
const LIVE_ITEMS: LibraryItem[] = [
  { type: "breakfast_crowd", label: "朝食の混雑", description: "空席・混雑のいまを表示" },
  { type: "dinner_crowd", label: "夕食の混雑", description: "レストラン空席・混雑のいまを表示" },
  { type: "spa_crowd", label: "大浴場の混雑", description: "大浴場の混雑のいまを表示" },
];

const MENU_ITEMS: LibraryItem[] = [
  { type: "menu", label: "メニュー一覧", description: "料理・サービスの一覧" },
  { type: "menu_categories", label: "カテゴリ別メニュー", description: "カテゴリごとにメニューを分ける" },
  { type: "daily_special", label: "本日のおすすめ", description: "おすすめメニューを強調" },
  { type: "drink_menu", label: "ドリンクメニュー", description: "サイズ・価格・備考付き" },
  { type: "combo_set_menu", label: "セット・コース", description: "セット内容と価格" },
  { type: "menu_grid", label: "表形式メニュー", description: "行と列で自由に編集できる表" },
  { type: "menu_time_band", label: "時間帯別メニュー", description: "時間帯で切り替えるメニュー（Business）" },
];

const OPERATION_ITEMS: LibraryItem[] = [
  { type: "button", label: "リンクボタン", description: "予約や外部サイトへのボタン" },
  { type: "pageLinks", label: "他ページへの入口", description: "アイコンで子ページや外部へ案内" },
  { type: "iconAccordion", label: "アイコンで開く案内", description: "アイコンを押すとその場で説明が開く" },
  { type: "campaign_timer", label: "キャンペーン残り時間", description: "終了までのカウントダウン（Pro）" },
  { type: "coupon", label: "クーポン", description: "特典コード・期限・注意事項（Pro）" },
  { type: "social_links", label: "SNSリンク", description: "Instagram・Xなどの導線" },
  { type: "contact_hub", label: "連絡先まとめ", description: "電話・メール・地図をまとめる" },
];

const COMPARISON_ITEMS: LibraryItem[] = [
  { type: "compare", label: "比較・料金表", description: "プラン比較や料金を表で見せる" },
  { type: "kpi", label: "数字の強調", description: "時間や数値を大きく見せる" },
  { type: "quote", label: "お客様の声", description: "レビュー・口コミを掲載" },
  { type: "checklist", label: "チェックリスト", description: "持ち物や確認項目を並べる" },
  { type: "steps", label: "手順ガイド", description: "手順を順番に表示" },
  { type: "dayTimeline", label: "一日のタイムライン", description: "時刻つきで一日の流れを縦に見せる" },
  { type: "progress_steps", label: "進捗の見える化", description: "いまどこまで進んだかを表示" },
];

const MEDIA_ITEMS: LibraryItem[] = [
  { type: "storyBand", label: "写真ストーリー帯", description: "大きな写真と短いコピーで雰囲気を伝える" },
  { type: "image_tiles", label: "写真ギャラリー", description: "写真グリッド。ラベル表示切替・タップでリンク可" },
  { type: "image", label: "写真1枚", description: "写真を1枚表示" },
  { type: "video", label: "動画", description: "YouTube・Vimeo・直リンクを埋め込み" },
  { type: "divider", label: "区切り線", description: "セクションの視覚的な区切り" },
  { type: "space", label: "余白", description: "上下のすき間を調整" },
];

const BASE_LIBRARY_SECTIONS: LibrarySection[] = [
  { id: "main", title: "ページの顔", items: MAIN_ITEMS },
  { id: "layouts", title: "文章・お知らせ", items: LAYOUT_ITEMS },
  { id: "guide", title: "施設・周辺案内", items: GUIDE_ITEMS },
  { id: "live", title: "混雑のいま", items: LIVE_ITEMS },
  { id: "menu", title: "メニュー", items: MENU_ITEMS },
  { id: "operation", title: "リンク・導線", items: OPERATION_ITEMS },
  { id: "comparison", title: "比較・手続き", items: COMPARISON_ITEMS },
  { id: "media", title: "写真・動画・余白", items: MEDIA_ITEMS },
];

const PERSONAL_HIDDEN_BLOCK_TYPES: CardType[] = [
  "scrollCards",
  "photoCompare",
];

const PERSONAL_LIBRARY_SECTIONS: LibrarySection[] = [
  {
    id: "start",
    title: "まず入れる",
    items: [
      { type: "hero", label: "トップ写真＋タイトル", description: "ページの第一印象を作る" },
      { type: "hero_slider", label: "写真スライド", description: "旅行やイベントの写真を切り替え表示" },
      { type: "welcome", label: "ひとこと・挨拶", description: "見てほしい人への導入メッセージ" },
      { type: "sectionTitle", label: "区切り見出し", description: "内容を見やすく分ける" },
    ],
  },
  {
    id: "plan",
    title: "予定・持ち物",
    items: [
      { type: "schedule", label: "日程・タイムライン", description: "集合から解散までを並べる" },
      { type: "dayTimeline", label: "一日の流れ", description: "時刻つきで予定を縦に見せる" },
      { type: "checklist", label: "持ち物・TODO", description: "持ち物や確認リスト" },
      { type: "steps", label: "流れ・ステップ", description: "準備や手順を順番に表示" },
      { type: "progress_steps", label: "進捗の見える化", description: "準備状況や現在地を見せる" },
    ],
  },
  {
    id: "photo",
    title: "写真・見せ方",
    items: [
      { type: "storyBand", label: "写真ストーリー", description: "大きな写真と短いコピー" },
      { type: "image_tiles", label: "写真ギャラリー", description: "複数の写真をきれいに並べる" },
      { type: "image", label: "写真1枚", description: "写真を1枚大きく表示" },
      { type: "video", label: "動画", description: "YouTube・Vimeo・直リンクを埋め込み" },
      { type: "tabs_info", label: "タブで切替", description: "写真や本文をタブで切り替える" },
    ],
  },
  {
    id: "links",
    title: "リンク・共有",
    items: [
      { type: "pageLinks", label: "リンクまとめ", description: "予約・地図・SNSなどへの入口" },
      { type: "button", label: "リンクボタン", description: "見てほしいURLへ誘導" },
      { type: "social_links", label: "SNSリンク", description: "Instagram・Xなどをまとめる" },
      { type: "contact_hub", label: "連絡先", description: "電話・メール・地図をまとめる" },
      { type: "map", label: "地図・集合場所", description: "待ち合わせや会場の住所" },
    ],
  },
  {
    id: "notice",
    title: "案内・お知らせ",
    items: [
      { type: "highlight", label: "大事な連絡", description: "変更や注意を目立たせる" },
      { type: "notice", label: "リマインド", description: "必ず読んでほしい連絡事項" },
      { type: "nearby", label: "行きたい場所", description: "スポットやおすすめをリスト化" },
      { type: "faq", label: "よくある質問", description: "迷いそうなことを先回りで共有" },
      { type: "accordion_info", label: "折りたたみ案内", description: "詳しい説明をタップで開く" },
      { type: "emergency_banner", label: "緊急の連絡", description: "集合変更など最優先の連絡" },
    ],
  },
  {
    id: "text",
    title: "文章・整理",
    items: [
      { type: "heading_body", label: "見出し＋本文", description: "タイトルと本文を書く" },
      { type: "text", label: "自由テキスト", description: "好きな文章を自由に書く" },
      { type: "quote", label: "ひとこと引用", description: "印象に残したい言葉を見せる" },
      { type: "compare", label: "比較表", description: "候補や料金を比較する" },
      { type: "kpi", label: "数字の強調", description: "時間や数値を大きく見せる" },
      { type: "divider", label: "区切り線", description: "セクションの視覚的な区切り" },
      { type: "space", label: "余白", description: "上下のすき間を調整" },
    ],
  },
];

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

/** Display label for settings / chrome (audience-aware). */
export function getCardTypeLabel(type: CardType, audience: LibraryAudience = "hotel"): string {
  if (audience === "personal") {
    return PERSONAL_LABEL_OVERRIDES[type]?.label ?? CARD_TYPE_LABELS[type] ?? type;
  }
  return CARD_TYPE_LABELS[type] ?? type;
}

export function getLibrarySections(audience: LibraryAudience): LibrarySection[] {
  if (audience === "personal") {
    return PERSONAL_LIBRARY_SECTIONS.map((section) => ({
      ...section,
      items: section.items
        .filter((item) => !PERSONAL_HIDDEN_BLOCK_TYPES.includes(item.type))
        .map(applyPersonalLabels),
    })).filter((section) => section.items.length > 0);
  }
  return BASE_LIBRARY_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => audience === "hotel" || !HOTEL_ONLY_BLOCK_TYPES.includes(item.type),
    ),
  })).filter((section) => section.items.length > 0);
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
