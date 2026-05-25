/** Web Editor 2.0 card model (aligned with `src/components/editor/types.ts`). */

export type CardType =
  | "hero"
  | "hero_slider"
  | "heading_body"
  | "info"
  | "highlight"
  | "action"
  | "welcome"
  | "wifi"
  | "breakfast"
  | "checkout"
  | "nearby"
  | "notice"
  | "map"
  | "restaurant"
  | "taxi"
  | "emergency"
  | "laundry"
  | "spa"
  | "text"
  | "icon"
  | "image"
  | "video"
  | "button"
  | "faq"
  | "schedule"
  | "menu"
  | "gallery"
  | "divider"
  | "parking"
  | "pageLinks"
  | "quote"
  | "checklist"
  | "steps"
  | "compare"
  | "kpi"
  | "space"
  | "campaign_timer"
  | "tabs_info"
  | "faq_search"
  | "notice_ticker"
  | "coupon"
  | "accordion_info"
  | "open_status"
  | "social_links"
  | "contact_hub"
  | "progress_steps"
  | "emergency_banner"
  | "scheduled_banner"
  | "menu_categories"
  | "daily_special"
  | "drink_menu"
  | "salon_service_menu"
  | "combo_set_menu"
  | "menu_grid"
  | "menu_sheet_sync"
  | "menu_time_band";

export type EditorCard = {
  id: string;
  type: CardType;
  content: Record<string, unknown>;
  style?: Record<string, unknown>;
  order: number;
};

export const BUSINESS_ONLY_CARD_TYPES: CardType[] = [
  "hero_slider",
  "campaign_timer",
  "notice_ticker",
  "coupon",
  "emergency_banner",
  "scheduled_banner",
  "menu_sheet_sync",
  "menu_time_band",
];

export const CARD_TYPE_LABELS: Partial<Record<CardType, string>> = {
  hero: "ヒーロー",
  hero_slider: "ヒーロースライド",
  heading_body: "見出し＋本文",
  text: "テキスト",
  image: "画像",
  gallery: "ギャラリー",
  quote: "引用",
  checklist: "チェックリスト",
  steps: "ステップ",
  schedule: "スケジュール",
  compare: "比較・料金表",
  action: "アクション",
  button: "ボタン",
  notice: "お知らせ",
  nearby: "周辺案内",
  map: "地図",
  divider: "区切り",
  space: "スペース",
  menu: "メニュー",
  campaign_timer: "キャンペーンタイマー",
};

export const CARD_LIBRARY_ITEMS: Array<{ type: CardType; label: string }> = [
  { type: "hero", label: "ヒーロー" },
  { type: "heading_body", label: "見出し＋本文" },
  { type: "text", label: "テキスト" },
  { type: "image", label: "画像" },
  { type: "gallery", label: "ギャラリー" },
  { type: "quote", label: "引用" },
  { type: "checklist", label: "チェックリスト" },
  { type: "steps", label: "ステップ" },
  { type: "schedule", label: "スケジュール" },
  { type: "compare", label: "比較・料金表" },
  { type: "action", label: "アクション" },
  { type: "notice", label: "お知らせ" },
  { type: "nearby", label: "周辺案内" },
  { type: "map", label: "地図" },
  { type: "divider", label: "区切り" },
  { type: "space", label: "スペース" },
  { type: "hero_slider", label: "ヒーロースライド" },
  { type: "campaign_timer", label: "キャンペーンタイマー" },
  { type: "notice_ticker", label: "お知らせティッカー" },
  { type: "coupon", label: "クーポン" },
  { type: "emergency_banner", label: "緊急告知" },
  { type: "scheduled_banner", label: "期間限定バナー" },
  { type: "menu_time_band", label: "時間帯別メニュー" },
];

export function isBusinessOnlyCard(type: CardType): boolean {
  return BUSINESS_ONLY_CARD_TYPES.includes(type);
}

export function cardTypeLabel(type: CardType): string {
  return CARD_TYPE_LABELS[type] ?? type;
}

export function createPlaceholderCard(type: CardType, id: string, order: number): EditorCard {
  return {
    id,
    type,
    content: { title: cardTypeLabel(type) },
    style: type === "space" ? { padding: 0 } : { innerBorderRadius: 8 },
    order,
  };
}

export function newCardId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
