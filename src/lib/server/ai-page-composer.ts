import { finalizeAiPageCards, type AiGeneratedCard } from "@/lib/ai-page-content-enrichment";
import type { GuestShellConfig, GuestShellNavStyle } from "@/lib/guest-shell";

const RESPONSES_API_URL = "https://api.openai.com/v1/responses";
const PRIMARY_MODEL = process.env.OPENAI_QUALITY_MODEL ?? "gpt-5.2";
const FALLBACK_MODEL = process.env.OPENAI_FALLBACK_MODEL ?? "gpt-4.1";

export const AI_COMPOSER_CARD_TYPES = [
  "hero", "welcome", "heading_body", "info", "highlight", "notice", "schedule",
  "dayTimeline", "steps", "checklist", "faq", "accordion_info", "iconAccordion",
  "map", "nearby", "button", "action", "pageLinks", "text", "divider", "wifi",
  "breakfast", "checkout", "emergency", "taxi", "parking", "restaurant", "laundry",
  "spa", "tabs_info", "kpi", "contact_hub", "social_links", "sectionTitle",
] as const;

type ComposerCardType = (typeof AI_COMPOSER_CARD_TYPES)[number];
type Density = "compact" | "balanced" | "detailed";
type Rhythm = "editorial" | "utility" | "guided" | "compact";

type RawCompositionCard = {
  type: ComposerCardType;
  purpose: string;
  contentJson: string;
  emphasis: "quiet" | "normal" | "strong";
  spacing: "tight" | "normal" | "airy";
};

type RawComposition = {
  pageTitle: string;
  designIntent: string;
  density: Density;
  rhythm: Rhythm;
  navigationStyle: GuestShellNavStyle;
  cards: RawCompositionCard[];
};

export type AiPageComposition = {
  title: string;
  cards: AiGeneratedCard[];
  guestShell: GuestShellConfig;
  design: {
    intent: string;
    density: Density;
    rhythm: Rhythm;
    navigationStyle: GuestShellNavStyle;
  };
  modelUsed: string;
  fallbackUsed: boolean;
};

const CARD_SCHEMAS: Record<ComposerCardType, string> = {
  hero: '{"title":"string","subtitle":"string"}',
  welcome: '{"title":"string","message":"string"}',
  heading_body: '{"title":"string","body":"string"}',
  info: '{"title":"string","rows":[{"label":"string","value":"string","show":true}]}',
  highlight: '{"title":"string","body":"string","accent":"amber|rose"}',
  notice: '{"title":"string","body":"string","variant":"info|warning"}',
  schedule: '{"title":"string","items":[{"day":"string","time":"string","label":"string"}]}',
  dayTimeline: '{"title":"string","items":[{"time":"string","title":"string","description":"string"}]}',
  steps: '{"title":"string","items":[{"title":"string","description":"string"}]}',
  checklist: '{"title":"string","items":[{"text":"string","checked":false}]}',
  faq: '{"title":"string","items":[{"q":"string","a":"string"}]}',
  accordion_info: '{"title":"string","items":[{"title":"string","body":"string"}]}',
  iconAccordion: '{"title":"string","items":[{"label":"string","description":"string","icon":"wifi|breakfast|checkout|map|phone|info|key|spa|restaurant|luggage","body":"string"}]}',
  map: '{"title":"string","address":"string","pins":[{"name":"string","walk":"string","note":"string"}]}',
  nearby: '{"title":"string","items":[{"name":"string","description":"string","link":"string"}]}',
  button: '{"label":"string","href":"string"}',
  action: '{"label":"string","href":"string"}',
  pageLinks: '{"title":"string","items":[{"label":"string","description":"string","icon":"string","link":"string"}]}',
  text: '{"title":"string","content":"string"}',
  divider: '{"style":"line|dotted"}',
  wifi: '{"ssid":"string","password":"string","description":"string"}',
  breakfast: '{"time":"string","location":"string","menu":"string"}',
  checkout: '{"title":"string","time":"string","note":"string"}',
  emergency: '{"title":"string","fire":"string","police":"string","hospital":"string","note":"string"}',
  taxi: '{"title":"string","phone":"string","companyName":"string","note":"string"}',
  parking: '{"title":"string","capacity":"string","fee":"string","note":"string","address":"string"}',
  restaurant: '{"title":"string","time":"string","location":"string","description":"string"}',
  laundry: '{"title":"string","time":"string","location":"string","fee":"string","note":"string"}',
  spa: '{"title":"string","time":"string","location":"string","note":"string"}',
  tabs_info: '{"title":"string","tabs":[{"label":"string","body":"string"}]}',
  kpi: '{"title":"string","items":[{"label":"string","value":"string"}]}',
  contact_hub: '{"title":"string","phone":"string","email":"string","lineUrl":"string","mapUrl":"string","note":"string"}',
  social_links: '{"title":"string","items":[{"platform":"instagram|x|facebook|youtube|tiktok|other","label":"string","href":"string","handle":"string"}]}',
  sectionTitle: '{"title":"string","subtitle":"string"}',
};

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["pageTitle", "designIntent", "density", "rhythm", "navigationStyle", "cards"],
  properties: {
    pageTitle: { type: "string" },
    designIntent: { type: "string" },
    density: { type: "string", enum: ["compact", "balanced", "detailed"] },
    rhythm: { type: "string", enum: ["editorial", "utility", "guided", "compact"] },
    navigationStyle: { type: "string", enum: ["off", "tabs", "hamburger"] },
    cards: {
      type: "array",
      minItems: 3,
      maxItems: 14,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "purpose", "contentJson", "emphasis", "spacing"],
        properties: {
          type: { type: "string", enum: AI_COMPOSER_CARD_TYPES },
          purpose: { type: "string" },
          contentJson: { type: "string" },
          emphasis: { type: "string", enum: ["quiet", "normal", "strong"] },
          spacing: { type: "string", enum: ["tight", "normal", "airy"] },
        },
      },
    },
  },
} as const;

function normalizeText(value: unknown, max = 800): string {
  return String(value ?? "").trim().slice(0, max);
}

function sanitizeUrl(value: unknown): string {
  const text = normalizeText(value, 500);
  if (!text) return "";
  if (text.startsWith("/") || text.startsWith("#")) return text;
  try {
    const parsed = new URL(text);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return undefined;
  if (typeof value === "string") return value.trim().slice(0, 1200);
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 12).map((item) => sanitizeValue(item, depth + 1));
  if (!value || typeof value !== "object") return undefined;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, 30)
      .map(([key, item]) => [key.slice(0, 60), sanitizeValue(item, depth + 1)])
      .filter(([, item]) => item !== undefined),
  );
}

function objectContent(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const clean = sanitizeValue(parsed);
    return clean && typeof clean === "object" && !Array.isArray(clean)
      ? clean as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function hashText(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(items: readonly T[], seed: number, offset: number): T {
  return items[(seed + offset) % items.length]!;
}

function rows(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item))).slice(0, 10)
    : [];
}

function normalizeCardContent(type: ComposerCardType, raw: Record<string, unknown>): Record<string, unknown> {
  const content = { ...raw };
  if ("href" in content) content.href = sanitizeUrl(content.href);
  if ("mapUrl" in content) content.mapUrl = sanitizeUrl(content.mapUrl);
  if ("lineUrl" in content) content.lineUrl = sanitizeUrl(content.lineUrl);
  if (Array.isArray(content.items)) {
    content.items = rows(content.items).map((item) => ({
      ...item,
      ...(Object.prototype.hasOwnProperty.call(item, "link") ? { link: sanitizeUrl(item.link) } : {}),
      ...(Object.prototype.hasOwnProperty.call(item, "href") ? { href: sanitizeUrl(item.href) } : {}),
      ...(type === "checklist" ? { checked: false } : {}),
    }));
  }
  if (type === "hero") delete content.image;
  if (type === "welcome") content.layout = "boxed";
  if (type === "info") {
    content.tone = "slate";
    content.rows = rows(content.rows).map((row) => ({ ...row, show: true }));
  }
  if (type === "tabs_info") {
    content.tabs = rows(content.tabs).map((tab) => {
      const cleanTab = { ...tab };
      delete cleanTab.imageSrc;
      return cleanTab;
    });
    content.defaultIndex = 0;
  }
  if (type === "map") content.mapEmbedUrl = "";
  return content;
}

const BOOKING_NOISE_RE =
  /ご予約に関|予約に関する注意|キャンセルポリシー|キャンセル料|キャンセル規定|予約サイト|旅行予約|オンライン予約|予約確認|事前決済|予約金|じゃらん|楽天トラベル|一休\.com|booking\.com/i;
const BOOKING_LINK_LABEL_RE = /^(ご?予約|ネット予約|オンライン予約|book(ing)? now)$/i;

function isOffStayBookingCopy(text: string): boolean {
  return BOOKING_NOISE_RE.test(text);
}

function cardPlainText(card: AiGeneratedCard): string {
  const content = card.content;
  const chunks = [
    content.title,
    content.subtitle,
    content.body,
    content.message,
    content.content,
    content.note,
    content.purpose,
  ].map((value) => normalizeText(value, 400));
  for (const list of [content.items, content.rows, content.tabs]) {
    for (const item of rows(list)) {
      chunks.push(
        normalizeText(item.label, 80),
        normalizeText(item.title, 80),
        normalizeText(item.body, 200),
        normalizeText(item.value, 120),
        normalizeText(item.q, 80),
        normalizeText(item.a, 200),
      );
    }
  }
  return chunks.filter(Boolean).join(" ");
}

function isBookingNoiseCard(card: AiGeneratedCard): boolean {
  if (card.type === "notice" || card.type === "highlight" || card.type === "text" || card.type === "heading_body") {
    return isOffStayBookingCopy(cardPlainText(card));
  }
  return false;
}

function isBookingLinkItem(item: Record<string, unknown>): boolean {
  const label = normalizeText(item.label, 40);
  if (BOOKING_LINK_LABEL_RE.test(label)) return true;
  return isOffStayBookingCopy(
    [label, normalizeText(item.description, 120), normalizeText(item.link, 200)].join(" "),
  );
}

function applyCompositionVariants(
  card: AiGeneratedCard,
  raw: RawCompositionCard,
  composition: RawComposition,
  seed: number,
  index: number,
): AiGeneratedCard {
  const content = { ...card.content };
  if (card.type === "hero") {
    content.layout = "overlay";
    content.overlayAlign = pick(["left", "center"] as const, seed, index + 7);
    content.widthMode = "full";
  }
  if (card.type === "welcome") {
    content.layout = "boxed";
  }
  if (card.type === "info") {
    content.layout = "table";
  }
  if (card.type === "pageLinks" || card.type === "iconAccordion") {
    content.styleVariant = "list";
    content.columns = 1;
    content.iconSize = composition.density === "compact" ? "sm" : "md";
    if (card.type === "pageLinks" && Array.isArray(content.items)) {
      content.items = rows(content.items)
        .filter((item) => !isBookingLinkItem(item))
        .map((item) => ({
          ...item,
          description: normalizeText(item.description, 48),
          linkType: normalizeText(item.link) ? "external" : "page",
          pageSlug: "",
        }));
    }
  }
  if (card.type === "sectionTitle") {
    content.align = pick(["left", "center"] as const, seed, index + 17);
    content.showLine = composition.rhythm !== "compact";
  }
  const isMediaHero = card.type === "hero" || card.type === "hero_slider";
  content._style = {
    innerBorderRadius: isMediaHero ? 0 : 12,
    padding: isMediaHero ? 0 : 12,
    titleFontSize: raw.emphasis === "strong" ? "lg" : "base",
    titleFontWeight: raw.emphasis === "strong" ? "bold" : "semibold",
  };
  return { ...card, content };
}

function isWifiDuplicateCopy(text: string): boolean {
  return /(wi-?fi|ssid|無線\s*lan|インターネット接続|free\s*wi-?fi)/i.test(text);
}

function stripWifiDuplicates(cards: AiGeneratedCard[]): AiGeneratedCard[] {
  const hasWifiBlock = cards.some((card) => card.type === "wifi");
  if (!hasWifiBlock) return cards;
  return cards.flatMap((card) => {
    if (card.type === "kpi") {
      const items = rows(card.content.items).filter(
        (item) => !isWifiDuplicateCopy(`${normalizeText(item.label, 80)} ${normalizeText(item.value, 120)}`),
      );
      if (items.length === 0) return [];
      return [{ ...card, content: { ...card.content, items } }];
    }
    if (card.type === "info") {
      const infoRows = rows(card.content.rows).filter(
        (row) => !isWifiDuplicateCopy(`${normalizeText(row.label, 80)} ${normalizeText(row.value, 120)}`),
      );
      if (infoRows.length === 0) return [];
      return [{ ...card, content: { ...card.content, rows: infoRows } }];
    }
    if (
      (card.type === "text" || card.type === "heading_body" || card.type === "notice" || card.type === "highlight")
      && isWifiDuplicateCopy(cardPlainText(card))
    ) {
      return [];
    }
    return [card];
  });
}

function extractPhone(cards: AiGeneratedCard[]): string {
  for (const card of cards) {
    const phone = normalizeText(card.content.phone, 40);
    if (phone.replace(/\D/g, "").length >= 3) return phone;
  }
  return "";
}

export function createCompositionGuestShell(
  requestedStyle: GuestShellNavStyle,
  cards: AiGeneratedCard[],
  pageSlug: string,
): GuestShellConfig {
  const phone = extractPhone(cards);
  const usefulLinks = phone ? 2 : 1;
  const navStyle = usefulLinks >= 2 ? requestedStyle : "off";
  return {
    enabled: navStyle !== "off",
    navStyle,
    tabs: [
      { id: "home", type: "home", label: "ホーム", enabled: true, pageSlug, icon: "home" },
      { id: "front", type: "phone", label: "フロント", enabled: Boolean(phone), phone: phone || null, icon: "phone" },
    ],
  };
}

function buildPrompt(sourceText: string, sourceKind: "description" | "official_website" | "pdf"): string {
  const schemas = AI_COMPOSER_CARD_TYPES.map((type) => `${type}: ${CARD_SCHEMAS[type]}`).join("\n");
  const sourceRule = sourceKind === "official_website"
    ? "公式サイトから確認できる事実だけを使う。不明項目を推測・補完しない。掲載写真・ロゴは取り込まない。"
    : sourceKind === "pdf"
      ? "添付PDFの本文・表から確認できる事実だけを使う。不明項目を推測・補完しない。PDF内の写真・ロゴは取り込まない。"
    : "入力にない時刻・料金・住所・電話番号・設備を作らない。創作してよいのは見出しと短い案内表現だけ。";
  return `Infomiiのスマートフォン向け案内ページを設計してください。単なる文章要約ではなく、閲覧者が知りたい順に情報を再構成してください。

このページは宿泊中の館内案内です。予約・販売ページではありません。

情報源:
${sourceText.slice(0, 24000)}

必須方針:
- ${sourceRule}
- 宿泊中にフロントへ聞かれること（Wi-Fi、朝食、大浴場、設備、駐車場、チェックアウト、緊急時、周辺）を優先する。
- 予約・キャンセル・料金プラン・OTA・予約サイト・予約確認・キャンセルポリシーの注意は入れない。notice / highlight / text にも書かない。
- pageLinks は電話・地図など滞在中の行動だけ。公式サイトの情報階層（客室・備品・予約）をタイル化して再現しない。設備や備品は info / iconAccordion / checklist でこのページに書く。
- 同じ情報を複数ブロックに書かない。Wi-FiのSSID・パスワードは wifi ブロックだけ。kpi（要点）にはチェックイン・チェックアウト・食事時間など短い時刻だけを入れ、SSIDや長文を入れない。
- 内容の目的、情報量、緊急度、反復閲覧の頻度からカードタイプと順番を選ぶ。
- 毎回同じ定番カード一式を並べない。情報がないカード、空のカード、重複カードは作らない。
- 冒頭、要点、詳細、行動導線のリズムを作る。必要なら sectionTitle や divider を使う。
- 3〜14ブロック。短い情報は3〜5、通常は6〜9、情報が多い時だけ10以上。
- navigationStyle は有効な電話導線がある運用ページなら tabs、情報量が多く複数ページ化に向くなら hamburger、短い単一ページなら off。
- contentJson は選んだカード型のJSONオブジェクトを文字列化したもの。記載のない値は空文字または省略し、既定値を発明しない。
- URLは情報源に明記されたものだけ。画像URLは一切含めない。

カード別contentJsonスキーマ:
${schemas}`;
}

async function requestComposition(
  apiKey: string,
  prompt: string,
  pdf?: { filename: string; base64: string },
): Promise<{ value: RawComposition; modelUsed: string; fallbackUsed: boolean }> {
  const models = PRIMARY_MODEL === FALLBACK_MODEL ? [PRIMARY_MODEL] : [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError = "AI composition failed";
  for (const [index, model] of models.entries()) {
    const response = await fetch(RESPONSES_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        instructions: "You are an information architect and Japanese hospitality UX writer. Return only the requested structured output.",
        input: pdf
          ? [{
              role: "user",
              content: [
                { type: "input_text", text: prompt },
                { type: "input_file", filename: pdf.filename, file_data: `data:application/pdf;base64,${pdf.base64}` },
              ],
            }]
          : prompt,
        text: { format: { type: "json_schema", name: "infomii_page_composition", strict: true, schema: RESPONSE_SCHEMA } },
      }),
    });
    if (!response.ok) {
      lastError = `AI request failed (${model}): ${(await response.text()).slice(0, 300)}`;
      continue;
    }
    const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const text = data.output_text ?? data.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
    if (!text) {
      lastError = `No structured output (${model})`;
      continue;
    }
    try {
      return { value: JSON.parse(text) as RawComposition, modelUsed: model, fallbackUsed: index > 0 };
    } catch {
      lastError = `Invalid structured output (${model})`;
    }
  }
  throw new Error(lastError);
}

export async function composeInfomiiPage(options: {
  apiKey: string;
  sourceText: string;
  sourceKind: "description" | "official_website" | "pdf";
  pageSlug: string;
  pdf?: { filename: string; base64: string };
}): Promise<AiPageComposition> {
  const result = await requestComposition(
    options.apiKey,
    buildPrompt(options.sourceText, options.sourceKind),
    options.pdf,
  );
  const seed = hashText(options.sourceText);
  const rawCards = result.value.cards
    .filter((card) => AI_COMPOSER_CARD_TYPES.includes(card.type))
    .map((card, index) => ({
      raw: card,
      card: {
        type: card.type,
        content: normalizeCardContent(card.type, objectContent(card.contentJson)),
        order: index,
      } satisfies AiGeneratedCard,
    }))
    .filter(({ card }) => Object.keys(card.content).length > 0)
    .filter(({ card }) => !isBookingNoiseCard(card));
  if (rawCards.length === 0) throw new Error("AI did not produce usable cards");

  const enriched = finalizeAiPageCards(rawCards.map(({ card }) => card), options.sourceText, {
    ensureHero: false,
    ensurePersonalSlider: false,
  });
  const rawByType = new Map<string, RawCompositionCard[]>();
  for (const { raw } of rawCards) rawByType.set(raw.type, [...(rawByType.get(raw.type) ?? []), raw]);
  const composed = enriched.map((card, index) => {
    const matching = rawByType.get(card.type)?.shift() ?? {
      type: card.type as ComposerCardType,
      purpose: "page structure",
      contentJson: "{}",
      emphasis: index === 0 ? "strong" : "normal",
      spacing: "normal",
    };
    return applyCompositionVariants(card, matching, result.value, seed, index);
  });
  const cards = stripWifiDuplicates(composed).filter((card) => {
    if (card.type !== "pageLinks") return true;
    return rows(card.content.items).length > 0;
  });

  const guestShell = createCompositionGuestShell(result.value.navigationStyle, cards, options.pageSlug);
  return {
    title: normalizeText(result.value.pageTitle, 80) || "AIで作成したページ",
    cards: cards.map((card, index) => ({ ...card, order: index })),
    guestShell,
    design: {
      intent: normalizeText(result.value.designIntent, 240),
      density: result.value.density,
      rhythm: result.value.rhythm,
      navigationStyle: guestShell.navStyle,
    },
    modelUsed: result.modelUsed,
    fallbackUsed: result.fallbackUsed,
  };
}
