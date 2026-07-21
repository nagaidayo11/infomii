import { personalDefaultContent } from "@/lib/editor/card-defaults-personal";
import { defaultFacilityContent } from "@/lib/editor/facility-info-presets";

/**
 * Infomii Editor 2.0 — Card-based page system.
 * Table: pages (id, title, slug, ...)
 * Table: cards (id, page_id, type, content, order, ...) — content may include _style for card style.
 *
 * Page has id, title, cards[].
 * Card has id, type, content, style, order. Cards are stored as an array and rendered in order.
 */

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
  | "breakfast_crowd"
  | "dinner_crowd"
  | "spa_crowd"
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
  /** @deprecated Prefer pageLinks. Existing pages only — hidden from library. */
  | "icon_shortcuts"
  | "image_tiles"
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
  /** @deprecated Abolished — existing pages only. Not in library; do not insert new. */
  | "salon_service_menu"
  | "combo_set_menu"
  | "menu_grid"
  /** @deprecated Abolished — existing pages only. Not in library; do not insert new. */
  | "menu_sheet_sync"
  | "menu_time_band";

/** Optional card chrome (padding, borders, typography, shadow). Stored with card. Legacy color keys in JSON are ignored by the renderer. */
export type CardStyle = Record<string, unknown>;

const FONT_SIZE_MAP: Record<string, string> = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
};

/** Optional font-weight keys for block style (maps to numeric CSS weight). */
const FONT_WEIGHT_MAP: Record<string, string> = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

/** CSS variable names for title/body font sizes (set on block wrapper, used by card components). */
export const BLOCK_TITLE_FONT_SIZE_VAR = "--block-title-font-size";
export const BLOCK_BODY_FONT_SIZE_VAR = "--block-body-font-size";

/** CSS variable names for title/body/global font weights. */
export const BLOCK_FONT_WEIGHT_VAR = "--block-font-weight";
export const BLOCK_TITLE_FONT_WEIGHT_VAR = "--block-title-font-weight";
export const BLOCK_BODY_FONT_WEIGHT_VAR = "--block-body-font-weight";

/** Default title/body weights when block style does not set CSS vars (600 / 400). */
export const DEFAULT_BLOCK_TITLE_FONT_WEIGHT = "600";
export const DEFAULT_BLOCK_BODY_FONT_WEIGHT = "400";

/** Resolve font size key to CSS value. */
export function resolveFontSize(key: string | undefined): string | undefined {
  return key && FONT_SIZE_MAP[key] ? FONT_SIZE_MAP[key] : undefined;
}

/** Resolve font weight key to numeric string (400–700). */
export function resolveFontWeight(key: string | undefined): string | undefined {
  return key && FONT_WEIGHT_MAP[key] ? FONT_WEIGHT_MAP[key] : undefined;
}

/** Style for title elements — block style CSS vars, then guest type tokens. */
export function getTitleFontSizeStyle(): import("react").CSSProperties {
  return {
    fontSize:
      "var(--block-title-font-size, var(--block-font-size, var(--guest-title-size, 1rem)))",
    fontWeight: `var(${BLOCK_TITLE_FONT_WEIGHT_VAR}, var(${BLOCK_FONT_WEIGHT_VAR}, var(--guest-title-weight, ${DEFAULT_BLOCK_TITLE_FONT_WEIGHT})))`,
  };
}

/** Style for body elements — block style CSS vars, then guest type tokens. */
export function getBodyFontSizeStyle(): import("react").CSSProperties {
  return {
    fontSize:
      "var(--block-body-font-size, var(--block-font-size, var(--guest-body-size, 0.875rem)))",
    fontWeight: `var(${BLOCK_BODY_FONT_WEIGHT_VAR}, var(${BLOCK_FONT_WEIGHT_VAR}, ${DEFAULT_BLOCK_BODY_FONT_WEIGHT}))`,
  };
}

/**
 * Guest card title utility (`.guest-card-title`). Size/weight come from
 * {@link getTitleFontSizeStyle} / CSS vars — do not add `font-bold` here or nested
 * `InlineEditable` will override block style font-weight.
 */
export const CARD_BLOCK_TITLE_CLASS = "guest-card-title" as const;

/** Guest card body utility (`.guest-card-body`). Prefer with {@link getBodyFontSizeStyle}. */
export const CARD_BLOCK_BODY_CLASS = "guest-card-body" as const;

/** Guest card caption / muted meta utility (`.guest-card-caption`). */
export const CARD_BLOCK_CAPTION_CLASS = "guest-card-caption" as const;

/**
 * Horizontal/vertical content inset for text blocks.
 * Matches 見出し＋本文セット (`HeadingBodyCard`) — keep titles on one vertical line.
 * Prefer `.guest-card-pad` when the block is a full guest surface.
 */
export const CARD_CONTENT_INSET_X = "px-3" as const;
export const CARD_CONTENT_INSET_Y = "py-3" as const;
export const CARD_CONTENT_INSET = "guest-card-pad" as const;

const DEFAULT_TRANSPARENT_MEDIA_TYPES: readonly CardType[] = ["hero", "hero_slider", "image", "gallery"] as const;
export const TRANSPARENT_MEDIA_CARD_TYPES = new Set<CardType>(DEFAULT_TRANSPARENT_MEDIA_TYPES);

export function isMediaCardType(type: CardType | undefined): type is CardType {
  return Boolean(type && TRANSPARENT_MEDIA_CARD_TYPES.has(type));
}

/**
 * Blocks that should always match the hero content-column width (page gutter intact).
 * Text / form-like cards are excluded so they can stay narrower if intentionally resized.
 */
const HERO_COLUMN_WIDTH_TYPES: ReadonlySet<CardType> = new Set<CardType>([
  "hero",
  "hero_slider",
  "image",
  "gallery",
  "image_tiles",
  "video",
  "map",
  "pageLinks",
  "icon_shortcuts",
  "action",
  "button",
  "divider",
  "notice",
  "notice_ticker",
  "campaign_timer",
  "emergency_banner",
  "scheduled_banner",
  "social_links",
  "contact_hub",
  "coupon",
  "menu",
  "menu_categories",
  "daily_special",
  "drink_menu",
  "salon_service_menu",
  "combo_set_menu",
  "menu_grid",
  "menu_sheet_sync",
  "menu_time_band",
]);

/** True when this card type should span the full hero column width. */
export function usesHeroColumnWidth(type: CardType | undefined): boolean {
  return Boolean(type && HERO_COLUMN_WIDTH_TYPES.has(type));
}

/**
 * Block wrapper styles for the editor / guest preview (padding, typography, shadow, inner radius).
 * Block background / transparency / inner-surface colors are not user-configurable; use default surfaces from components.
 */
export function getBlockStyle(card: { style?: CardStyle; type?: CardType }): import("react").CSSProperties {
  const s = card.style;
  if (!s || typeof s !== "object") return {};
  const fontSizeKey = s.fontSize as string | undefined;
  const fontSize = resolveFontSize(fontSizeKey);
  const titleFontSize = resolveFontSize(s.titleFontSize as string | undefined);
  const bodyFontSize = resolveFontSize(s.bodyFontSize as string | undefined);
  const fontWeightKey = s.fontWeight as string | undefined;
  const fontWeight = resolveFontWeight(fontWeightKey);
  const titleFontWeight = resolveFontWeight(s.titleFontWeight as string | undefined);
  const bodyFontWeight = resolveFontWeight(s.bodyFontWeight as string | undefined);
  const innerR = (s as Record<string, unknown>).innerBorderRadius;
  const innerRadiusPx =
    typeof innerR === "number" && Number.isFinite(innerR)
      ? `${innerR}px`
      : typeof innerR === "string" && innerR.trim()
        ? innerR.trim()
        : undefined;
  const style: Record<string, string | number | undefined> = {
    boxShadow: typeof s.boxShadow === "string" ? s.boxShadow : undefined,
    padding:
      typeof s.padding === "number"
        ? `${s.padding}px`
        : typeof s.padding === "string"
          ? s.padding
          : undefined,
    color: typeof s.textColor === "string" ? s.textColor : undefined,
    textAlign:
      s.textAlign === "left" || s.textAlign === "center" || s.textAlign === "right"
        ? s.textAlign
        : undefined,
    lineHeight:
      typeof s.lineHeight === "number"
        ? String(s.lineHeight)
        : typeof s.lineHeight === "string"
          ? s.lineHeight
          : undefined,
    fontFamily: typeof s.fontFamily === "string" ? s.fontFamily : undefined,
    fontSize,
  };
  if (typeof s.fontFamily === "string") {
    (style as Record<string, string>)["--editor-card-font-family"] = s.fontFamily;
  }
  if (fontSize) (style as Record<string, string>)["--block-font-size"] = fontSize;
  if (titleFontSize) style[BLOCK_TITLE_FONT_SIZE_VAR] = titleFontSize;
  if (bodyFontSize) style[BLOCK_BODY_FONT_SIZE_VAR] = bodyFontSize;
  if (fontWeight) (style as Record<string, string>)[BLOCK_FONT_WEIGHT_VAR] = fontWeight;
  if (titleFontWeight) (style as Record<string, string>)[BLOCK_TITLE_FONT_WEIGHT_VAR] = titleFontWeight;
  if (bodyFontWeight) (style as Record<string, string>)[BLOCK_BODY_FONT_WEIGHT_VAR] = bodyFontWeight;
  if (innerRadiusPx) {
    (style as Record<string, string>)["--editor-inner-border-radius"] = innerRadiusPx;
  }
  if (
    card.type &&
    BUSINESS_ONLY_CARD_TYPES.includes(card.type) &&
    card.type !== "hero_slider" &&
    card.type !== "menu_time_band" &&
    typeof (s as Record<string, unknown>).innerTonePreset === "string"
  ) {
    const tone = ((s as Record<string, unknown>).innerTonePreset as string).trim();
    const toneMap: Record<string, { bg: string; border: string }> = {
      slate: { bg: "#f8fafc", border: "#e2e8f0" },
      blue: { bg: "#eff6ff", border: "#bfdbfe" },
      emerald: { bg: "#ecfdf5", border: "#a7f3d0" },
      amber: { bg: "#fffbeb", border: "#fde68a" },
      rose: { bg: "#fff1f2", border: "#fecdd3" },
      violet: { bg: "#f5f3ff", border: "#ddd6fe" },
    };
    const resolved = toneMap[tone];
    if (resolved) {
      (style as Record<string, string>)["--editor-inner-surface-bg"] = resolved.bg;
      (style as Record<string, string>)["--editor-inner-surface-border"] = resolved.border;
    }
  }
  if (isMediaCardType(card.type)) {
    // Media blocks should blend with page background by default.
    (style as Record<string, string>)["--editor-block-surface"] = "transparent";
    (style as Record<string, string>)["--editor-card-surface"] = "transparent";
  }
  return style as import("react").CSSProperties;
}

/** Card structure: id, type, content, style, order. Rendered in order. */
export type Card = {
  id: string;
  type: CardType;
  content: Record<string, unknown>;
  style?: CardStyle;
  order: number;
};

/** Editor card (alias for Card; may include page_id, created_at from API). */
export type EditorCard = Card & {
  page_id?: string;
  created_at?: string;
};

/** Page structure: id, title, cards[]. Cards are stored as array and rendered in order. */
export type Page = {
  id: string;
  title: string;
  /** Cards in display order (sorted by order). */
  cards: Card[];
};

export type EditorPage = {
  id: string;
  title: string;
  slug: string;
  user_id: string;
  created_at: string;
};

/** カードタイプのラベル（日本語・変更しない） */
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  hero: "ヒーロー",
  hero_slider: "ヒーロースライド",
  heading_body: "見出し＋本文セット",
  info: "情報",
  highlight: "ハイライト",
  action: "アクション",
  welcome: "ウェルカム",
  wifi: "WiFi",
  breakfast: "施設案内",
  breakfast_crowd: "朝食混雑",
  dinner_crowd: "夕食混雑",
  spa_crowd: "大浴場混雑",
  checkout: "チェックアウト",
  nearby: "周辺案内",
  notice: "お知らせ",
  map: "地図＋周辺ピン",
  restaurant: "レストラン",
  taxi: "タクシー",
  emergency: "緊急連絡先",
  laundry: "ランドリー",
  spa: "スパ・温泉",
  text: "テキスト",
  icon: "アイコン",
  image: "画像",
  video: "動画",
  button: "ボタン",
  faq: "よくある質問",
  schedule: "営業時間一覧",
  menu: "メニュー一覧",
  gallery: "ギャラリー",
  divider: "区切り線",
  parking: "駐車場",
  pageLinks: "ページリンク",
  icon_shortcuts: "アイコンショートカット",
  image_tiles: "画像タイル",
  quote: "引用",
  checklist: "チェックリスト",
  steps: "ステップ",
  compare: "比較",
  kpi: "KPI",
  space: "スペース",
  campaign_timer: "キャンペーンタイマー",
  tabs_info: "タブ切替",
  faq_search: "FAQ検索",
  notice_ticker: "お知らせティッカー",
  coupon: "クーポン",
  accordion_info: "アコーディオン案内",
  open_status: "営業時間ステータス",
  social_links: "SNSリンク集",
  contact_hub: "連絡先ハブ",
  progress_steps: "進捗ステップ",
  emergency_banner: "緊急告知バナー",
  scheduled_banner: "期間限定バナー",
  menu_categories: "カテゴリ別メニュー",
  daily_special: "本日のおすすめ",
  drink_menu: "ドリンクメニュー",
  salon_service_menu: "施術メニュー",
  combo_set_menu: "セット・コース",
  menu_grid: "メニュー表（グリッド）",
  menu_sheet_sync: "メニュー（CSV連携）",
  menu_time_band: "時間帯別メニュー",
};

/** Card types shown in the editor library (Canva-style). */
export const EDITOR_LIBRARY_CARD_TYPES: CardType[] = [
  "hero",
  "hero_slider",
  "heading_body",
  "info",
  "highlight",
  "action",
  "notice",
  "map",
  "image",
  "video",
  "text",
  "quote",
  "checklist",
  "steps",
  "compare",
  "kpi",
  "campaign_timer",
  "tabs_info",
  "faq_search",
  "notice_ticker",
  "coupon",
  "accordion_info",
  "open_status",
  "social_links",
  "contact_hub",
  "progress_steps",
  "emergency_banner",
  "scheduled_banner",
  "gallery",
  "menu",
  "menu_categories",
  "daily_special",
  "drink_menu",
  "combo_set_menu",
  "menu_grid",
  "menu_time_band",
  "divider",
  "space",
];

/** Card library items for the canvas editor. Click inserts at bottom of page. */
export const CARD_LIBRARY_ITEMS: Array<{ type: CardType; label: string; description: string }> = [
  { type: "hero", label: "ヒーロー", description: "大画像＋タイトル" },
  { type: "hero_slider", label: "ヒーロースライド", description: "複数画像を切替表示" },
  { type: "heading_body", label: "見出し＋本文セット", description: "見出しと本文を縦に表示" },
  { type: "info", label: "情報", description: "WiFi・構造化情報" },
  { type: "highlight", label: "ハイライト", description: "強調ブロック" },
  { type: "action", label: "アクション", description: "ボタン・CTA" },
  { type: "notice", label: "お知らせ", description: "告知・注意" },
  { type: "map", label: "地図＋周辺ピン", description: "地図と周辺スポットを一体表示" },
  { type: "image", label: "画像", description: "写真" },
  { type: "video", label: "動画", description: "YouTube・Vimeo・直リンク" },
  { type: "text", label: "テキスト", description: "見出し・本文" },
  { type: "quote", label: "引用", description: "引用文・レビュー" },
  { type: "checklist", label: "チェックリスト", description: "タスク・持ち物確認" },
  { type: "steps", label: "ステップ", description: "手順を段階表示" },
  { type: "compare", label: "比較・料金表", description: "2列比較または料金・プラン表（最大4列）" },
  { type: "kpi", label: "KPI", description: "数値ハイライト" },
  { type: "campaign_timer", label: "キャンペーンタイマー", description: "開始/終了カウントダウン（Pro）" },
  { type: "tabs_info", label: "タブ切替", description: "写真＋本文をタブで切替表示" },
  { type: "faq_search", label: "FAQ検索", description: "よくある質問を一覧表示" },
  { type: "notice_ticker", label: "お知らせティッカー", description: "流れるお知らせ（Pro）" },
  { type: "coupon", label: "クーポン", description: "特典コード表示（Pro）" },
  { type: "accordion_info", label: "アコーディオン案内", description: "折りたたみ式Q&A/案内" },
  { type: "open_status", label: "営業時間ステータス", description: "現在営業中かを表示" },
  { type: "social_links", label: "SNSリンク集", description: "SNS導線をまとめて表示" },
  { type: "contact_hub", label: "連絡先ハブ", description: "電話/メール/地図導線を集約" },
  { type: "progress_steps", label: "進捗ステップ", description: "手続き進捗を段階表示" },
  { type: "emergency_banner", label: "緊急告知バナー", description: "最優先告知を表示" },
  { type: "scheduled_banner", label: "期間限定バナー", description: "期間内のみ表示（Business）" },
  { type: "gallery", label: "ギャラリー", description: "画像グリッド" },
  { type: "menu", label: "メニュー一覧", description: "一覧（飲食テーマの静的サンプル画像）" },
  { type: "menu_categories", label: "カテゴリ別メニュー", description: "カテゴリ帯もテーマ別の静的サンプル" },
  { type: "daily_special", label: "本日のおすすめ", description: "おすすめ強調（飲食テーマの静的サンプル）" },
  { type: "drink_menu", label: "ドリンクメニュー", description: "サイズ価格・備考（飲料テーマの静的サンプル）" },
  { type: "combo_set_menu", label: "セット・コース", description: "内容・価格（コース向け静的サンプル）" },
  { type: "menu_grid", label: "メニュー表（グリッド）", description: "行・列を自由に編集できるメニュー表" },
  { type: "menu_time_band", label: "時間帯別メニュー", description: "時間帯切替（飲食テーマの静的サンプル・Business）" },
  { type: "divider", label: "区切り", description: "セクション区切り" },
  { type: "space", label: "スペース", description: "余白を追加" },
];

/** Card types used for new-page starter set (Hero first, then Info, Highlight, …). */
export const STARTER_CARD_TYPES: CardType[] = [
  "hero",
  "info",
  "highlight",
  "checkout",
  "nearby",
];

/** Full list (all card types) — for backwards compatibility / migration. */
export const CARD_LIBRARY_ITEMS_FULL: Array<{ type: CardType; label: string; description: string }> = [
  { type: "hero", label: "ヒーロー", description: "大画像＋タイトル" },
  { type: "hero_slider", label: "ヒーロースライド", description: "複数画像を切替表示" },
  { type: "heading_body", label: "見出し＋本文セット", description: "見出しと本文を縦に表示" },
  { type: "info", label: "情報", description: "構造化情報・WiFi" },
  { type: "highlight", label: "ハイライト", description: "強調ブロック" },
  { type: "action", label: "アクション", description: "ボタン・CTA" },
  { type: "welcome", label: "ウェルカム", description: "おもてなしメッセージ" },
  { type: "wifi", label: "WiFi", description: "SSID・パスワード" },
  { type: "breakfast", label: "朝食", description: "時間・会場・メニュー" },
  { type: "breakfast_crowd", label: "朝食混雑", description: "空席・混雑のいま" },
  { type: "dinner_crowd", label: "夕食混雑", description: "レストラン空席・混雑のいま" },
  { type: "spa_crowd", label: "大浴場混雑", description: "大浴場の混雑のいま" },
  { type: "checkout", label: "チェックアウト", description: "時刻・補足・リンク" },
  { type: "nearby", label: "周辺案内", description: "近隣スポット・アクセス" },
  { type: "notice", label: "お知らせ", description: "告知・注意事項" },
  { type: "map", label: "地図＋周辺ピン", description: "地図と周辺スポットを一体表示" },
  { type: "restaurant", label: "レストラン", description: "営業時間・場所・メニュー" },
  { type: "taxi", label: "タクシー", description: "電話番号・会社名・備考" },
  { type: "emergency", label: "緊急連絡先", description: "火災・警察・病院など" },
  { type: "laundry", label: "ランドリー", description: "営業時間・料金・連絡先" },
  { type: "spa", label: "スパ・温泉", description: "時間・場所・説明" },
  { type: "text", label: "テキスト", description: "見出し・本文" },
  { type: "image", label: "画像", description: "写真" },
  { type: "video", label: "動画", description: "YouTube・Vimeo・mp4/webm" },
  { type: "button", label: "ボタン", description: "リンクボタン" },
  { type: "schedule", label: "営業時間一覧", description: "時間割を一覧化（動的強調はBusinessプラン）" },
  { type: "menu", label: "メニュー一覧", description: "一覧（飲食テーマの静的サンプル画像）" },
  { type: "menu_categories", label: "カテゴリ別メニュー", description: "カテゴリ帯もテーマ別の静的サンプル" },
  { type: "daily_special", label: "本日のおすすめ", description: "おすすめ強調（飲食テーマの静的サンプル）" },
  { type: "drink_menu", label: "ドリンクメニュー", description: "サイズ価格・備考（飲料テーマの静的サンプル）" },
  { type: "combo_set_menu", label: "セット・コース", description: "内容・価格（コース向け静的サンプル）" },
  { type: "menu_grid", label: "メニュー表（グリッド）", description: "行・列を自由に編集できるメニュー表" },
  { type: "menu_time_band", label: "時間帯別メニュー", description: "時間帯切替（飲食テーマの静的サンプル・Business）" },
  { type: "parking", label: "駐車場", description: "台数・料金・場所" },
  { type: "pageLinks", label: "ページリンク", description: "子ページへのアイコンリンク" },
  { type: "quote", label: "引用", description: "引用文・レビュー" },
  { type: "checklist", label: "チェックリスト", description: "チェック項目" },
  { type: "steps", label: "ステップ", description: "手順を段階表示" },
  { type: "compare", label: "比較・料金表", description: "2列比較または料金表" },
  { type: "kpi", label: "KPI", description: "指標・実績表示" },
  { type: "campaign_timer", label: "キャンペーンタイマー", description: "開始/終了カウントダウン（Pro）" },
  { type: "tabs_info", label: "タブ切替", description: "写真＋本文をタブで切替表示" },
  { type: "faq_search", label: "FAQ検索", description: "よくある質問を一覧表示" },
  { type: "notice_ticker", label: "お知らせティッカー", description: "流れるお知らせ（Pro）" },
  { type: "coupon", label: "クーポン", description: "特典コード表示（Pro）" },
  { type: "accordion_info", label: "アコーディオン案内", description: "折りたたみ式Q&A/案内" },
  { type: "open_status", label: "営業時間ステータス", description: "現在営業中かを表示" },
  { type: "breakfast_crowd", label: "朝食混雑", description: "空席・混雑のいま" },
  { type: "dinner_crowd", label: "夕食混雑", description: "レストラン空席・混雑のいま" },
  { type: "spa_crowd", label: "大浴場混雑", description: "大浴場の混雑のいま" },
  { type: "social_links", label: "SNSリンク集", description: "SNS導線をまとめて表示" },
  { type: "contact_hub", label: "連絡先ハブ", description: "電話/メール/地図導線を集約" },
  { type: "progress_steps", label: "進捗ステップ", description: "手続き進捗を段階表示" },
  { type: "emergency_banner", label: "緊急告知バナー", description: "最優先告知を表示" },
  { type: "scheduled_banner", label: "期間限定バナー", description: "期間内のみ表示（Business）" },
  { type: "space", label: "スペース", description: "余白" },
];

/** Pro 以上で利用可能なブロック（訴求・プロモ系） */
export const PRO_AND_ABOVE_CARD_TYPES: CardType[] = [
  "notice_ticker",
  "coupon",
  "campaign_timer",
];

/** Business プラン限定ブロック（自動化・動的運用） */
export const BUSINESS_ONLY_CARD_TYPES: CardType[] = [
  "scheduled_banner",
  "menu_time_band",
];

export type EditorPlanTier = "free" | "pro" | "business";

export function getMinimumPlanForCardType(type: CardType): EditorPlanTier {
  if (BUSINESS_ONLY_CARD_TYPES.includes(type)) return "business";
  if (PRO_AND_ABOVE_CARD_TYPES.includes(type)) return "pro";
  return "free";
}

export function canUseCardType(
  type: CardType,
  plan: EditorPlanTier | null | undefined,
): boolean {
  const minimum = getMinimumPlanForCardType(type);
  if (minimum === "free") return true;
  if (!plan) return false;
  if (minimum === "pro") return plan === "pro" || plan === "business";
  return plan === "business";
}

export function isGatedCardType(type: CardType): boolean {
  return getMinimumPlanForCardType(type) !== "free";
}

/** Default sample image (hero / image / gallery block presets). */
export const PRESET_HERO_SAMPLE_IMAGE = "/hero-block-default-1.png";
export const PRESET_HERO_SLIDER_SECOND_SAMPLE_IMAGE = "/templates/previews/business/515b796d.jpg";
export const PRESET_HERO_SLIDER_THIRD_SAMPLE_IMAGE = "/templates/previews/business/4bfe5cc6.jpg";
export const PRESET_HERO_SLIDER_FOURTH_SAMPLE_IMAGE = "/templates/previews/guide/b325ae5a.jpg";
export const PRESET_HERO_SLIDER_FIFTH_SAMPLE_IMAGE = "/templates/previews/business/fd57e76a.jpg";
export const HERO_SLIDER_MAX_ITEMS = 5;

export function createDefaultHeroSliderSlide(index: number): Record<string, unknown> {
  const presets = [
    { src: PRESET_HERO_SAMPLE_IMAGE, alt: "メインイメージ", caption: "チェックインのご案内" },
    { src: PRESET_HERO_SLIDER_SECOND_SAMPLE_IMAGE, alt: "朝食イメージ", caption: "朝食ビュッフェのご案内" },
    { src: PRESET_HERO_SLIDER_THIRD_SAMPLE_IMAGE, alt: "館内施設イメージ", caption: "館内施設のご案内" },
    { src: PRESET_HERO_SLIDER_FOURTH_SAMPLE_IMAGE, alt: "周辺観光イメージ", caption: "周辺観光のご案内" },
    { src: PRESET_HERO_SLIDER_FIFTH_SAMPLE_IMAGE, alt: "ご滞在サポートイメージ", caption: "ご滞在サポートのご案内" },
  ] as const;
  const picked = presets[Math.max(0, Math.min(index, presets.length - 1))];
  return {
    src: picked.src,
    alt: picked.alt,
    caption: picked.caption,
    linkEnabled: false,
    linkType: "internal",
    href: "",
    openInNewTab: false,
  };
}

/**
 * Menu系カードの静的サンプル画像（`public/` 配置・追加ブロック時は API 呼び出しなし）。
 * 飲食／ドリンク／サロンでテーマを分け、LP やアプリ UI のスクショは使わない。
 */
export const PRESET_MENU_HERO_DINING = "/preset-menu-hero-dining.jpg";
export const PRESET_MENU_HERO_BEVERAGE = "/preset-menu-hero-beverage.jpg";
export const PRESET_MENU_HERO_SALON = "/preset-menu-hero-salon.jpg";
/** セット・コース向け（複数皿・飲み物のテーブルショット） */
export const PRESET_MENU_HERO_COURSE = "/preset-menu-hero-course.jpg";
export const PRESET_MENU_THUMB_FOOD = "/preset-menu-thumb-food.jpg";
export const PRESET_MENU_THUMB_BEVERAGE = "/preset-menu-thumb-beverage.jpg";
export const PRESET_MENU_THUMB_SALON = "/preset-menu-thumb-salon.jpg";
/** カテゴリ帯（フード想定のダイニングテーブル） */
export const PRESET_MENU_BANNER_CATEGORY = "/preset-menu-banner-category.jpg";
/** ドリンクカテゴリ帯（飲料写真・ヒーローと同アセット可） */
export const PRESET_MENU_BANNER_BEVERAGE = "/preset-menu-hero-beverage.jpg";

function defaultContent(type: CardType): Record<string, unknown> {
  switch (type) {
    case "hero":
      return {
        title: "Infomii Hotel",
        image: PRESET_HERO_SAMPLE_IMAGE,
        subtitle: "館内案内をスマートにまとめました",
        widthMode: "full",
      };
    case "hero_slider":
      return {
        title: "おすすめ案内",
        autoplay: true,
        intervalSec: 4,
        transitionEnabled: true,
        transitionType: "fade",
        transitionDurationMs: 500,
        showCaptions: true,
        height: "s",
        widthMode: "full",
        slides: [
          createDefaultHeroSliderSlide(0),
          createDefaultHeroSliderSlide(1),
          createDefaultHeroSliderSlide(2),
          createDefaultHeroSliderSlide(3),
          createDefaultHeroSliderSlide(4),
        ],
      };
    case "wifi":
    case "taxi":
    case "laundry":
    case "parking":
    case "breakfast":
    case "spa":
    case "restaurant":
      return defaultFacilityContent(type) ?? { title: "" };
    case "info":
      return {
        title: "",
        icon: "",
        tone: "slate",
        rows: [{ label: "", value: "", show: true }],
      };
    case "checkout":
      return {
        title: "チェックアウト",
        time: "11:00",
        note: "延長をご希望の方はフロントまでご相談ください。",
        show_time: true,
        show_note: true,
        linkUrl: "",
        linkLabel: "チェックアウト手順",
      };
    case "action":
      return { label: "詳細を見る", href: "#" };
    case "welcome":
      return {
        title: "ご宿泊ありがとうございます",
        message:
          "滞在中によく使うご案内をまとめています。ご不明な点はフロント内線9までお気軽にお問い合わせください。",
      };
    case "breakfast_crowd":
      return {
        title: "朝食の混雑いま",
        level: "open",
        note: "最終入場は9:00です。混雑時は少々お待ちいただく場合があります。",
        updatedAt: new Date().toISOString(),
      };
    case "dinner_crowd":
      return {
        title: "夕食の混雑いま",
        level: "open",
        note: "混雑状況は随時更新しています。",
        updatedAt: new Date().toISOString(),
      };
    case "spa_crowd":
      return {
        title: "大浴場の混雑いま",
        level: "open",
        note: "タオルは客室からご持参ください。混雑時は入場をお待ちいただく場合があります。",
        updatedAt: new Date().toISOString(),
      };
    case "nearby":
      return {
        title: "周辺案内",
        items: [
          { name: "コンビニ", description: "徒歩2分 / 24時間営業", link: "" },
          { name: "駅", description: "徒歩8分", link: "" },
        ],
      };
    case "notice":
      return {
        title: "客室清掃について",
        body: "客室清掃は10:00–14:00に実施します。在室のまま清掃をご希望の場合はフロントまでお知らせください。",
        variant: "info",
      };
    case "map":
      return {
        title: "アクセス・周辺",
        address: "東京都港区芝公園1-2-3",
        mapEmbedUrl: "",
        pins: [
          { name: "コンビニ", walk: "徒歩2分", note: "24時間営業" },
          { name: "最寄り駅", walk: "徒歩8分", note: "" },
          { name: "薬局", walk: "徒歩5分", note: "" },
        ],
      };
    case "emergency":
      return {
        title: "緊急連絡先",
        fire: "119",
        police: "110",
        hospital: "最寄り救急病院はフロントにお尋ねください",
        note: "体調不良の際は、まずフロント内線9へご連絡ください。",
        show_note: true,
      };
    case "text":
      return {
        title: "ご案内",
        content: "チェックイン後は、Wi-Fi・朝食・大浴場のご案内をご確認ください。",
      };
    case "heading_body":
      return {
        title: "館内のご案内",
        body: "よく使う情報をわかりやすくまとめています。施設の最新情報はフロントでもご確認いただけます。",
        dividerEnabled: false,
        dividerStyle: "solid",
      };
    case "highlight":
      return {
        title: "お静かにご協力ください",
        body: "22:00以降は客室フロアでお静かにお過ごしください。",
        accent: "amber",
      };
    case "icon":
      return { icon: "info", label: "ご案内", description: "詳細はフロントまで" };
    case "image":
      return { src: PRESET_HERO_SAMPLE_IMAGE, alt: "施設イメージ" };
    case "video":
      return { title: "館内のご紹介", videoUrl: "", caption: "" };
    case "button":
      return { label: "公式サイトを見る", href: "https://example.com" };
    case "faq":
      return {
        title: "よくある質問",
        items: [
          { q: "タクシーは頼めますか？", a: "フロント内線9で手配できます。早朝は前夜予約がおすすめです。" },
          { q: "延泊はできますか？", a: "空室状況により前日20:00まで承ります。" },
        ],
      };
    case "schedule":
      return {
        title: "営業時間",
        dynamicEnabled: false,
        timezone: "Asia/Tokyo",
        rules: [],
        items: [
          { day: "レストラン", time: "7:00-22:00", label: "ラストオーダー 21:30" },
          { day: "大浴場", time: "15:00-24:00", label: "朝 6:00-10:00 も利用可" },
        ],
      };
    case "menu":
      return {
        title: "メニュー",
        heroSrc: PRESET_MENU_HERO_DINING,
        heroAlt: "メニューのイメージ",
        items: [
          {
            name: "朝食ビュッフェ",
            price: "1,800円",
            description: "和洋30種以上",
            imageSrc: PRESET_MENU_THUMB_FOOD,
            imageAlt: "料理イメージ",
          },
          { name: "ルームサービス", price: "900円〜", description: "22:00まで注文可能" },
        ],
      };
    case "gallery":
      return {
        title: "フォトギャラリー",
        columns: 2,
        items: [
          { src: PRESET_HERO_SAMPLE_IMAGE, alt: "客室", caption: "スタンダードツイン" },
          { src: PRESET_HERO_SAMPLE_IMAGE, alt: "レストラン", caption: "朝食会場" },
          { src: PRESET_HERO_SAMPLE_IMAGE, alt: "大浴場", caption: "大浴場" },
          { src: PRESET_HERO_SAMPLE_IMAGE, alt: "ロビー", caption: "ロビー" },
        ],
      };
    case "divider":
      return { style: "line" };
    case "space":
      return { height: 48 };
    case "campaign_timer":
      return {
        title: "春のキャンペーン",
        description: "公式サイト限定の特典をご用意しています。",
        startAt: "",
        endAt: "",
        hideBeforeStart: false,
        hideAfterEnd: false,
        showSeconds: true,
        ctaLabel: "詳細を見る",
        ctaUrl: "",
      };
    case "tabs_info":
      return {
        title: "施設のご案内",
        defaultIndex: 0,
        accentColor: "#0f766e",
        tabs: [
          {
            label: "朝食",
            body: "ご朝食は 7:00–9:30、1F ダイニングにてご用意しています。",
            imageSrc: PRESET_HERO_SAMPLE_IMAGE,
          },
          {
            label: "大浴場",
            body: "15:00–24:00 / 6:00–10:00。タオルは客室にございます。",
            imageSrc: PRESET_HERO_SAMPLE_IMAGE,
          },
          {
            label: "アクセス",
            body: "最寄り駅から徒歩7分。タクシーで約15分です。",
            imageSrc: "",
          },
        ],
      };
    case "faq_search":
      return {
        title: "よくあるご質問",
        items: [
          { q: "チェックインは何時からですか？", a: "15:00からです。" },
          { q: "WiFiは利用できますか？", a: "客室・ロビーでご利用いただけます。" },
        ],
      };
    case "notice_ticker":
      return {
        title: "お知らせ",
        items: ["本日の大浴場は通常営業です。", "朝食会場は1Fダイニングです。"],
        speed: "normal",
        pauseOnHover: true,
      };
    case "coupon":
      return {
        title: "ご宿泊者限定クーポン",
        code: "WELCOME10",
        expiryText: "有効期限: 2026/12/31",
        notes: "チェックイン時にフロントでご提示ください。",
        ctaLabel: "詳細を見る",
        ctaUrl: "",
        ctaBgColor: "#0f172a",
        ctaTextColor: "#ffffff",
      };
    case "accordion_info":
      return {
        title: "よくあるご質問",
        accentColor: "#0f766e",
        items: [
          {
            title: "チェックイン・チェックアウト",
            body: "チェックインは15:00から、チェックアウトは11:00までです。",
          },
          {
            title: "荷物のお預かり",
            body: "ご宿泊当日はフロントにてお預かりいたします。",
          },
          {
            title: "駐車場について",
            body: "先着順・有料です。満車の場合は近隣をご案内します。",
          },
        ],
      };
    case "open_status":
      return {
        title: "フロント営業時間",
        mode: "manual",
        openNow: true,
        openLabel: "営業中",
        closedLabel: "営業時間外",
        hoursText: "7:00-23:00",
      };
    case "social_links":
      return {
        title: "公式SNS",
        labelStyle: "icon",
        items: [
          { platform: "instagram", label: "Instagram", href: "", handle: "@infomii_hotel" },
          { platform: "x", label: "X", href: "", handle: "@infomii" },
        ],
      };
    case "contact_hub":
      return {
        title: "お問い合わせ",
        phone: "03-1234-5678",
        email: "front@example.com",
        lineUrl: "",
        mapUrl: "",
        note: "ご不明点はお気軽にお問い合わせください。",
      };
    case "progress_steps":
      return {
        title: "ご利用の流れ",
        currentStep: 2,
        items: [
          { label: "予約確認", done: true },
          { label: "チェックイン", done: false },
          { label: "ご案内確認", done: false },
        ],
      };
    case "emergency_banner":
      return {
        title: "緊急のお知らせ",
        message: "設備点検のため一部エリアを一時閉鎖しています。",
        level: "high",
      };
    case "scheduled_banner":
      return {
        title: "期間限定のお知らせ",
        message: "春の特典キャンペーン実施中です。",
        startAt: "",
        endAt: "",
      };
    case "parking":
      return { title: "駐車場", capacity: "20台", fee: "1泊 1,200円", note: "先着順 / 満車時は近隣をご案内します", address: "ホテル裏手" };
    case "pageLinks":
      return {
        title: "館内のご案内",
        columns: 2,
        iconSize: "md",
        styleVariant: "tile",
        tileShadowStrength: "md",
        circleIconShadowStrength: "md",
        accentColor: "#0f766e",
        items: [
          {
            label: "チェックイン",
            description: "15:00〜",
            icon: "key",
            linkType: "page" as const,
            pageSlug: "",
            link: "",
          },
          {
            label: "Wi-Fi",
            description: "客室・ロビー",
            icon: "wifi",
            linkType: "page" as const,
            pageSlug: "",
            link: "",
          },
          {
            label: "朝食",
            description: "6:30–10:00",
            icon: "breakfast",
            linkType: "page" as const,
            pageSlug: "",
            link: "",
          },
          {
            label: "チェックアウト",
            description: "11:00まで",
            icon: "checkout",
            linkType: "page" as const,
            pageSlug: "",
            link: "",
          },
        ],
      };
    case "icon_shortcuts":
      return {
        title: "",
        columns: 3,
        iconSize: "md",
        styleVariant: "circle",
        tileShadowStrength: "md",
        circleIconShadowStrength: "md",
        items: [
          { label: "WiFi", icon: "wifi", linkType: "page" as const, pageSlug: "", link: "" },
          { label: "館内施設", icon: "spa", linkType: "page" as const, pageSlug: "", link: "" },
          { label: "レストラン", icon: "restaurant", linkType: "page" as const, pageSlug: "", link: "" },
        ],
      };
    case "image_tiles":
      return {
        title: "",
        columns: 2,
        items: [
          {
            src: PRESET_HERO_SAMPLE_IMAGE,
            label: "レストラン",
            linkType: "page" as const,
            pageSlug: "",
            link: "",
          },
          {
            src: PRESET_HERO_SAMPLE_IMAGE,
            label: "大浴場",
            linkType: "page" as const,
            pageSlug: "",
            link: "",
          },
          {
            src: PRESET_HERO_SAMPLE_IMAGE,
            label: "貸切風呂",
            linkType: "page" as const,
            pageSlug: "",
            link: "",
          },
          {
            src: PRESET_HERO_SAMPLE_IMAGE,
            label: "交通案内",
            linkType: "page" as const,
            pageSlug: "",
            link: "",
          },
        ],
      };
    case "quote":
      return { quote: "ご滞在を心地よくするためのご案内をこちらに記載します。", author: "フロント" };
    case "checklist":
      return {
        title: "チェックリスト",
        items: [
          { text: "チェックイン時に本人確認書類を提示", checked: true },
          { text: "Wi-Fiの接続完了", checked: false },
          { text: "チェックアウト時刻を確認", checked: false },
        ],
      };
    case "steps":
      return {
        title: "ご利用ステップ",
        items: [
          { title: "Step 1", description: "QRを読み取りページを開く" },
          { title: "Step 2", description: "必要な案内を確認する" },
          { title: "Step 3", description: "不明点はフロントへ連絡" },
        ],
      };
    case "compare":
      return {
        layout: "pricing",
        title: "客室タイプ・料金",
        pricingColumnHeaders: ["シングル", "ダブル", "ツイン"],
        pricingRows: [
          { label: "おすすめポイント", values: ["1名向け", "カップル向け", "2ベッド"] },
          { label: "定員", values: ["1名", "2名", "2名"] },
          { label: "料金（税サ込・目安）", values: ["7,800円〜", "9,800円〜", "10,800円〜"] },
        ],
        highlightColumnIndex: 1,
        leftTitle: "スタンダード",
        leftBody: "朝食付き・通常チェックアウト",
        rightTitle: "プレミアム",
        rightBody: "朝食+レイトチェックアウト+特典",
      };
    case "kpi":
      return {
        title: "ご案内の要点",
        items: [
          { label: "チェックイン", value: "15:00" },
          { label: "チェックアウト", value: "11:00" },
          { label: "フロント内線", value: "9" },
        ],
      };
    case "menu_categories":
      return {
        title: "メニュー",
        heroSrc: PRESET_MENU_HERO_DINING,
        heroAlt: "メニューのイメージ",
        categories: [
          {
            title: "フード",
            imageSrc: PRESET_MENU_BANNER_CATEGORY,
            imageAlt: "フードカテゴリのイメージ",
            items: [
              { name: "本日のパスタ", price: "980円", description: "トマトソース", tag: "人気" },
              { name: "季節のサラダ", price: "450円", description: "", tag: "" },
            ],
          },
          {
            title: "ドリンク",
            imageSrc: PRESET_MENU_BANNER_BEVERAGE,
            imageAlt: "ドリンクカテゴリのイメージ",
            items: [
              { name: "アイスコーヒー", price: "350円", description: "", tag: "" },
            ],
          },
        ],
      };
    case "daily_special":
      return {
        title: "本日のおすすめ",
        heroSrc: PRESET_MENU_HERO_DINING,
        heroAlt: "本日のおすすめのイメージ",
        showDate: true,
        items: [
          {
            name: "漁港直送の刺身盛り",
            price: "1,480円",
            description: "数量限定",
            imageSrc: PRESET_MENU_THUMB_FOOD,
            imageAlt: "おすすめ料理のイメージ",
          },
          { name: "シェフ特製スープ", price: "380円", description: "" },
        ],
      };
    case "drink_menu":
      return {
        title: "ドリンク",
        heroSrc: PRESET_MENU_HERO_BEVERAGE,
        heroAlt: "ドリンクメニューのイメージ",
        items: [
          {
            name: "ブレンドコーヒー",
            sizes: "S 350円 / L 450円",
            note: "ICE / HOT",
            imageSrc: PRESET_MENU_THUMB_BEVERAGE,
            imageAlt: "ドリンクのイメージ",
          },
          { name: "オレンジジュース", sizes: "M 400円", note: "" },
        ],
      };
    case "salon_service_menu":
      return {
        title: "施術メニュー",
        heroSrc: PRESET_MENU_HERO_SALON,
        heroAlt: "サロンのイメージ",
        items: [
          {
            name: "カット",
            duration: "60分",
            price: "4,400円",
            description: "シャンプー込み",
            imageSrc: PRESET_MENU_THUMB_SALON,
            imageAlt: "施術のイメージ",
          },
          { name: "カラー", duration: "90分", price: "8,800円〜", description: "" },
        ],
      };
    case "combo_set_menu":
      return {
        title: "セット・コース",
        heroSrc: PRESET_MENU_HERO_COURSE,
        heroAlt: "セットメニューのイメージ",
        items: [
          {
            name: "ランチセット",
            includes: "メイン＋ドリンク＋サラダ",
            price: "1,200円",
            imageSrc: PRESET_MENU_THUMB_FOOD,
            imageAlt: "セットのイメージ",
          },
          { name: "お得なペアコース", includes: "Wメイン＋デザート", price: "3,800円" },
        ],
      };
    case "menu_grid":
      return {
        title: "メニュー表",
        columns: 3,
        rows: [
          ["品名", "価格", "備考"],
          ["ブレンドコーヒー", "450円", "HOT/ICE"],
          ["ミックスサンド", "680円", "数量限定"],
        ],
        hasHeader: true,
        showBorder: true,
        cellPadding: "md",
      };
    case "menu_sheet_sync":
      return {
        title: "メニュー",
        csvUrl: "",
        delimiter: ",",
        hasHeader: true,
        nameColumn: 0,
        priceColumn: 1,
        descriptionColumn: 2,
        tagColumn: -1,
        fallbackText: "メニューを読み込めませんでした。時間をおいて再度お試しください。",
        cacheTtlSec: 120,
      };
    case "menu_time_band":
      return {
        title: "時間帯別メニュー",
        heroSrc: PRESET_MENU_HERO_DINING,
        heroAlt: "時間帯メニューのイメージ",
        timezone: "Asia/Tokyo",
        currentBandLabel: "ただいまのメニュー",
        outsideMessage: "現在この時間帯の提供メニューはありません。",
        slots: [
          {
            label: "ランチ",
            start: "11:00",
            end: "14:00",
            items: [
              {
                name: "ランチプレート",
                price: "980円",
                description: "11:00〜14:00",
                tag: "",
                imageSrc: PRESET_MENU_THUMB_FOOD,
                imageAlt: "ランチ料理のイメージ",
              },
            ],
          },
          {
            label: "ディナー",
            start: "17:00",
            end: "21:00",
            items: [
              { name: "シェフおまかせコース", price: "4,800円", description: "要予約", tag: "" },
            ],
          },
        ],
      };
    default:
      return { content: "" };
  }
}

export function createEmptyCard(
  type: CardType,
  id: string,
  order: number,
  audience: "hotel" | "personal" = "hotel",
): EditorCard {
  let content = defaultContent(type);
  if (audience === "personal") {
    const personal = personalDefaultContent(type);
    if (personal !== null) content = personal;
  }
  return {
    id,
    type,
    content,
    style: type === "space" ? { padding: 0 } : { innerBorderRadius: 8 },
    order,
  };
}
