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
  | "kpi";

/** Optional card appearance (e.g. background, padding). Stored with card. */
export type CardStyle = Record<string, unknown>;

const FONT_SIZE_MAP: Record<string, string> = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
};

/** CSS variable names for title/body font sizes (set on block wrapper, used by card components). */
export const BLOCK_TITLE_FONT_SIZE_VAR = "--block-title-font-size";
export const BLOCK_BODY_FONT_SIZE_VAR = "--block-body-font-size";

/** Resolve font size key to CSS value. */
export function resolveFontSize(key: string | undefined): string | undefined {
  return key && FONT_SIZE_MAP[key] ? FONT_SIZE_MAP[key] : undefined;
}

/** Style for title elements - use var from block wrapper, fallback to block fontSize then 1rem. */
export function getTitleFontSizeStyle(): import("react").CSSProperties {
  return { fontSize: "var(--block-title-font-size, var(--block-font-size, 1rem))" };
}

/** Style for body elements - use var from block wrapper, fallback to block fontSize then 0.875rem. */
export function getBodyFontSizeStyle(): import("react").CSSProperties {
  return { fontSize: "var(--block-body-font-size, var(--block-font-size, 0.875rem))" };
}

/** Extract block style (borderRadius, boxShadow, backgroundColor, fontSize, titleFontSize, bodyFontSize) for rendering. */
export function getBlockStyle(card: { style?: CardStyle }): import("react").CSSProperties {
  const s = card.style;
  if (!s || typeof s !== "object") return { borderRadius: "8px" };
  const transparentOn = Boolean((s as Record<string, unknown>).backgroundTransparent);
  const borderEnabledRaw = (s as Record<string, unknown>).borderEnabled;
  const borderEnabled = borderEnabledRaw === undefined ? true : Boolean(borderEnabledRaw);
  const fontSizeKey = s.fontSize as string | undefined;
  const fontSize = resolveFontSize(fontSizeKey);
  const titleFontSize = resolveFontSize(s.titleFontSize as string | undefined);
  const bodyFontSize = resolveFontSize(s.bodyFontSize as string | undefined);
  const style: Record<string, string | number | undefined> = {
    borderRadius:
      typeof s.borderRadius === "string"
        ? s.borderRadius
        : typeof s.borderRadius === "number"
          ? `${s.borderRadius}px`
          : "8px",
    boxShadow: typeof s.boxShadow === "string" ? s.boxShadow : undefined,
    borderWidth: borderEnabled
      ? (
      typeof s.borderWidth === "number"
        ? `${s.borderWidth}px`
        : typeof s.borderWidth === "string"
          ? s.borderWidth
          : undefined
        )
      : "0px",
    borderColor: typeof s.borderColor === "string" ? s.borderColor : undefined,
    borderStyle:
      typeof s.borderWidth === "number" && s.borderWidth > 0
        ? "solid"
        : typeof s.borderStyle === "string"
          ? s.borderStyle
          : undefined,
    padding:
      typeof s.padding === "number"
        ? `${s.padding}px`
        : typeof s.padding === "string"
          ? s.padding
          : undefined,
    backgroundColor: transparentOn
      ? "transparent"
      : typeof s.backgroundColor === "string"
        ? s.backgroundColor
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
  if (fontSize) (style as Record<string, string>)["--block-font-size"] = fontSize;
  if (transparentOn) {
    (style as Record<string, string>)["--editor-block-surface"] = "transparent";
  } else if (typeof s.backgroundColor === "string") {
    (style as Record<string, string>)["--editor-block-surface"] = s.backgroundColor;
  }
  if (titleFontSize) style[BLOCK_TITLE_FONT_SIZE_VAR] = titleFontSize;
  if (bodyFontSize) style[BLOCK_BODY_FONT_SIZE_VAR] = bodyFontSize;
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
  info: "情報",
  highlight: "ハイライト",
  action: "アクション",
  welcome: "ウェルカム",
  wifi: "WiFi",
  breakfast: "施設案内",
  checkout: "チェックアウト",
  nearby: "周辺案内",
  notice: "お知らせ",
  map: "地図",
  restaurant: "レストラン",
  taxi: "タクシー",
  emergency: "緊急連絡先",
  laundry: "ランドリー",
  spa: "スパ・温泉",
  text: "テキスト",
  icon: "アイコン",
  image: "画像",
  button: "ボタン",
  faq: "よくある質問",
  schedule: "スケジュール",
  menu: "メニュー",
  gallery: "ギャラリー",
  divider: "区切り線",
  parking: "駐車場",
  pageLinks: "ページリンク",
  quote: "引用",
  checklist: "チェックリスト",
  steps: "ステップ",
  compare: "比較",
  kpi: "KPI",
};

/** Card types shown in the editor library (Canva-style). */
export const EDITOR_LIBRARY_CARD_TYPES: CardType[] = [
  "hero",
  "info",
  "highlight",
  "action",
  "notice",
  "map",
  "image",
  "text",
  "quote",
  "checklist",
  "steps",
  "compare",
  "kpi",
  "gallery",
  "divider",
];

/** Card library items for the canvas editor. Click inserts at bottom of page. */
export const CARD_LIBRARY_ITEMS: Array<{ type: CardType; label: string; description: string }> = [
  { type: "hero", label: "ヒーロー", description: "大画像＋タイトル" },
  { type: "info", label: "情報", description: "WiFi・構造化情報" },
  { type: "highlight", label: "ハイライト", description: "強調ブロック" },
  { type: "action", label: "アクション", description: "ボタン・CTA" },
  { type: "notice", label: "お知らせ", description: "告知・注意" },
  { type: "map", label: "地図", description: "住所・地図" },
  { type: "image", label: "画像", description: "写真" },
  { type: "text", label: "テキスト", description: "見出し・本文" },
  { type: "icon", label: "アイコン", description: "絵文字＋ラベル" },
  { type: "quote", label: "引用", description: "引用文・レビュー" },
  { type: "checklist", label: "チェックリスト", description: "タスク・持ち物確認" },
  { type: "steps", label: "ステップ", description: "手順を段階表示" },
  { type: "compare", label: "比較", description: "2列比較・プラン比較" },
  { type: "kpi", label: "KPI", description: "数値ハイライト" },
  { type: "gallery", label: "ギャラリー", description: "画像グリッド" },
  { type: "divider", label: "区切り", description: "セクション区切り" },
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
  { type: "info", label: "情報", description: "構造化情報・WiFi" },
  { type: "highlight", label: "ハイライト", description: "強調ブロック" },
  { type: "action", label: "アクション", description: "ボタン・CTA" },
  { type: "welcome", label: "ウェルカム", description: "おもてなしメッセージ" },
  { type: "wifi", label: "WiFi", description: "SSID・パスワード・説明" },
  { type: "breakfast", label: "朝食", description: "時間・会場・メニュー" },
  { type: "checkout", label: "チェックアウト", description: "時刻・補足・リンク" },
  { type: "nearby", label: "周辺案内", description: "近隣スポット・アクセス" },
  { type: "notice", label: "お知らせ", description: "告知・注意事項" },
  { type: "map", label: "地図", description: "住所・地図" },
  { type: "restaurant", label: "レストラン", description: "営業時間・場所・メニュー" },
  { type: "taxi", label: "タクシー", description: "電話番号・会社名・備考" },
  { type: "emergency", label: "緊急連絡先", description: "火災・警察・病院" },
  { type: "laundry", label: "ランドリー", description: "営業時間・料金・連絡先" },
  { type: "spa", label: "スパ・温泉", description: "時間・場所・説明" },
  { type: "text", label: "テキスト", description: "見出し・本文" },
  { type: "icon", label: "アイコン", description: "絵文字＋ラベル" },
  { type: "image", label: "画像", description: "写真" },
  { type: "button", label: "ボタン", description: "リンクボタン" },
  { type: "schedule", label: "スケジュール", description: "営業時間" },
  { type: "menu", label: "メニュー", description: "メニュー・価格" },
  { type: "parking", label: "駐車場", description: "台数・料金・場所" },
  { type: "pageLinks", label: "ページリンク", description: "子ページへのアイコンリンク" },
  { type: "quote", label: "引用", description: "引用文・レビュー" },
  { type: "checklist", label: "チェックリスト", description: "チェック項目" },
  { type: "steps", label: "ステップ", description: "手順・導線" },
  { type: "compare", label: "比較", description: "2カラム比較" },
  { type: "kpi", label: "KPI", description: "指標・実績表示" },
];

function defaultContent(type: CardType): Record<string, unknown> {
  switch (type) {
    case "hero":
      return { title: "Infomii Hotel", image: "", subtitle: "" };
    case "info":
      return { title: "Wi-Fi", icon: "wifi", rows: [{ label: "ネットワーク名", value: "" }, { label: "パスワード", value: "" }] };
    case "highlight":
      return { title: "重要なお知らせ", body: "", accent: "amber" };
    case "action":
      return { label: "詳しく見る", href: "#" };
    case "welcome":
      return { title: "ようこそ", message: "ご宿泊ありがとうございます。ごゆっくりお過ごしください。" };
    case "wifi":
      return { ssid: "", password: "", description: "" };
    case "breakfast":
      return { title: "施設案内", time: "7:00–9:30", location: "1F ダイニング", menu: "" };
    case "checkout":
      return { title: "チェックアウト", time: "11:00", note: "", linkUrl: "", linkLabel: "詳細" };
    case "nearby":
      return { title: "周辺案内", items: [{ name: "", description: "", link: "" }] };
    case "notice":
      return { title: "お知らせ", body: "", variant: "info" };
    case "map":
      return { title: "地図", address: "ホテル住所", mapEmbedUrl: "" };
    case "restaurant":
      return { title: "レストラン", time: "", location: "", menu: "" };
    case "taxi":
      return { title: "タクシー", phone: "", companyName: "", note: "" };
    case "emergency":
      return { title: "緊急連絡先", fire: "119", police: "110", hospital: "", note: "" };
    case "laundry":
      return { title: "ランドリー", hours: "", priceNote: "", contact: "" };
    case "spa":
      return { title: "スパ・温泉", hours: "", location: "", description: "", note: "" };
    case "text":
      return { content: "テキストを入力" };
    case "icon":
      return { icon: "📍", label: "ラベル", description: "" };
    case "image":
      return { src: "", alt: "" };
    case "button":
      return { label: "ボタン", href: "#" };
    case "faq":
      return { title: "よくある質問", items: [{ q: "", a: "" }] };
    case "schedule":
      return { title: "営業時間", items: [{ day: "月〜日", time: "7:00–22:00", label: "" }] };
    case "menu":
      return { title: "メニュー", items: [{ name: "", price: "", description: "" }] };
    case "gallery":
      return { title: "", columns: 2, items: [{ src: "", alt: "" }] };
    case "divider":
      return { style: "line" };
    case "parking":
      return { title: "駐車場", capacity: "", fee: "", note: "", address: "" };
    case "pageLinks":
      return {
        title: "メニュー",
        columns: 3,
        items: [
          { label: "WiFi", icon: "wifi", linkType: "page" as const, pageSlug: "", link: "" },
          { label: "朝食", icon: "breakfast", linkType: "page" as const, pageSlug: "", link: "" },
          { label: "チェックアウト", icon: "checkout", linkType: "page" as const, pageSlug: "", link: "" },
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
        title: "プラン比較",
        leftTitle: "スタンダード",
        leftBody: "朝食付き・通常チェックアウト",
        rightTitle: "プレミアム",
        rightBody: "朝食+レイトチェックアウト+特典",
      };
    case "kpi":
      return {
        title: "施設情報",
        items: [
          { label: "チェックイン", value: "15:00" },
          { label: "チェックアウト", value: "11:00" },
          { label: "フロント内線", value: "9" },
        ],
      };
    default:
      return { content: "" };
  }
}

export function createEmptyCard(type: CardType, id: string, order: number): EditorCard {
  return {
    id,
    type,
    content: defaultContent(type),
    style: { borderRadius: 8 },
    order,
  };
}
