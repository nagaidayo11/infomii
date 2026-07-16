/**
 * Pre-publish / pre-preview quality checks for guest pages.
 * Returns short, concrete findings for a front-desk checklist UI.
 */

import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import {
  coerceLiveOpsLevel,
  getLiveOpsDefinition,
  liveOpsKeyForCardType,
  liveOpsUpdatedAtMs,
  type LiveOpsKey,
} from "@/lib/editor/live-ops";
import { getGuestShellNavStyle, type GuestShellConfig } from "@/lib/guest-shell";
import type { EditorCard } from "@/components/editor/types";
import { collectMissingTranslationTargets } from "@/lib/editor/batch-translate-cards";

export type PageQualitySeverity = "error" | "warning";

export type PageQualityFinding = {
  severity: PageQualitySeverity;
  code: string;
  message: string;
  cardId?: string;
};

export type PageQualityCheckOptions = {
  cards: EditorCard[];
  /** Guest shell for the page (nav link checks). */
  guestShell?: GuestShellConfig | null;
  /** Known hotel page slugs — used when present to flag dead page links. */
  knownPageSlugs?: ReadonlySet<string> | readonly string[];
  /** Business plan: include missing translation count. */
  includeMissingTranslations?: boolean;
  /** Stale threshold for live-ops crowd cards (default 12h). */
  liveOpsStaleHours?: number;
  /** Page title (blank / junk detection). */
  pageTitle?: string | null;
  /** Clock override for tests. */
  nowMs?: number;
};

const DEFAULT_LIVE_OPS_STALE_HOURS = 12;
const MAX_FINDINGS = 8;
const LAYOUT_ONLY = new Set(["space", "divider"]);

/** Live-ops type → matching static facility card (soft pairing hint). */
const LIVE_OPS_STATIC_PAIR: ReadonlyArray<{
  crowdType: string;
  staticType: string;
  code: string;
  message: string;
}> = [
  {
    crowdType: "breakfast_crowd",
    staticType: "breakfast",
    code: "live_ops_without_static_breakfast",
    message: "朝食ブロックがありません（混雑のみ）",
  },
  {
    crowdType: "spa_crowd",
    staticType: "spa",
    code: "live_ops_without_static_spa",
    message: "大浴場ブロックがありません（混雑のみ）",
  },
];

function readJa(value: unknown): string {
  return getLocalizedContent(value as LocalizedString | undefined, "ja").trim();
}

function hasMediaSrc(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function knownSlugSet(
  known?: ReadonlySet<string> | readonly string[],
): Set<string> | null {
  if (!known) return null;
  if (known instanceof Set) return known;
  const next = new Set<string>();
  for (const s of known) {
    if (typeof s === "string" && s.trim()) next.add(s.trim());
  }
  return next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCardVisuallyEmpty(card: EditorCard): boolean {
  if (LAYOUT_ONLY.has(card.type)) return true;
  const c = card.content ?? {};
  if (card.type === "text") {
    return !readJa(c.title) && !readJa(c.content) && !readJa(c.body);
  }
  if (card.type === "heading_body") {
    return !readJa(c.title) && !readJa(c.body);
  }
  return false;
}

function checkWifi(card: EditorCard, out: PageQualityFinding[]): void {
  if (card.type !== "wifi") return;
  const c = card.content ?? {};
  if (!readJa(c.ssid)) {
    out.push({
      severity: "error",
      code: "wifi_ssid_empty",
      message: "Wi‑FiのSSIDが空です",
      cardId: card.id,
    });
  }
  if (!readJa(c.password)) {
    out.push({
      severity: "error",
      code: "wifi_password_empty",
      message: "Wi‑Fiのパスワードが空です",
      cardId: card.id,
    });
  }
}

function checkHero(card: EditorCard, out: PageQualityFinding[]): void {
  const c = card.content ?? {};
  if (card.type === "hero") {
    if (!hasMediaSrc(c.image) && !hasMediaSrc(c.src)) {
      out.push({
        severity: "error",
        code: "hero_image_missing",
        message: "ヒーロー画像がありません",
        cardId: card.id,
      });
    }
    return;
  }
  if (card.type !== "hero_slider") return;
  const slides = Array.isArray(c.slides) ? c.slides : [];
  const withImage = slides.filter(
    (slide) =>
      slide &&
      typeof slide === "object" &&
      !Array.isArray(slide) &&
      hasMediaSrc((slide as Record<string, unknown>).src),
  );
  if (slides.length === 0 || withImage.length === 0) {
    out.push({
      severity: "error",
      code: "hero_slider_image_missing",
      message: "ヒーロースライドに画像がありません",
      cardId: card.id,
    });
  }
}

function checkMap(card: EditorCard, out: PageQualityFinding[]): void {
  if (card.type !== "map") return;
  const c = card.content ?? {};
  if (!readJa(c.address)) {
    out.push({
      severity: "error",
      code: "map_address_empty",
      message: "地図の住所が空です",
      cardId: card.id,
    });
  }
}

function checkNearby(card: EditorCard, out: PageQualityFinding[]): void {
  if (card.type !== "nearby") return;
  const c = card.content ?? {};
  const items = Array.isArray(c.items) ? c.items : [];
  if (items.length === 0) {
    out.push({
      severity: "warning",
      code: "nearby_items_empty",
      message: "周辺スポットがありません",
      cardId: card.id,
    });
    return;
  }
  const unnamed = items.filter(
    (item) => isRecord(item) && !readJa(item.name),
  ).length;
  if (unnamed > 0) {
    out.push({
      severity: "warning",
      code: "nearby_name_empty",
      message:
        unnamed === 1
          ? "周辺案内のスポット名が空です"
          : `周辺案内のスポット名が空です（${unnamed}件）`,
      cardId: card.id,
    });
  }
}

function checkEmergency(card: EditorCard, out: PageQualityFinding[]): void {
  if (card.type !== "emergency") return;
  const c = card.content ?? {};
  const fire = typeof c.fire === "string" ? c.fire.trim() : "";
  const police = typeof c.police === "string" ? c.police.trim() : "";
  const hospital = readJa(c.hospital);
  if (!fire && !police && !hospital) {
    out.push({
      severity: "error",
      code: "emergency_phone_empty",
      message: "緊急連絡先の番号が空です",
      cardId: card.id,
    });
  }
}

function checkContactHub(card: EditorCard, out: PageQualityFinding[]): void {
  if (card.type !== "contact_hub") return;
  const c = card.content ?? {};
  const phone = typeof c.phone === "string" ? c.phone.trim() : "";
  if (!phone) {
    out.push({
      severity: "error",
      code: "contact_phone_empty",
      message: "連絡先の電話番号が空です",
      cardId: card.id,
    });
  }
}

function checkCheckout(card: EditorCard, out: PageQualityFinding[]): void {
  if (card.type !== "checkout") return;
  const c = card.content ?? {};
  if (!readJa(c.time)) {
    out.push({
      severity: "error",
      code: "checkout_time_empty",
      message: "チェックアウト時刻が空です",
      cardId: card.id,
    });
  }
}

function checkBreakfast(card: EditorCard, out: PageQualityFinding[]): void {
  if (card.type !== "breakfast") return;
  const c = card.content ?? {};
  if (!readJa(c.time)) {
    out.push({
      severity: "error",
      code: "breakfast_time_empty",
      message: "朝食の時間が空です",
      cardId: card.id,
    });
  }
  if (!readJa(c.location)) {
    out.push({
      severity: "error",
      code: "breakfast_location_empty",
      message: "朝食の会場が空です",
      cardId: card.id,
    });
  }
}

function checkFaq(card: EditorCard, out: PageQualityFinding[]): void {
  if (card.type !== "faq" && card.type !== "faq_search") return;
  const c = card.content ?? {};
  const items = Array.isArray(c.items) ? c.items : [];
  const usable = items.filter(
    (item) => isRecord(item) && (readJa(item.q) || readJa(item.a)),
  );
  if (usable.length === 0) {
    out.push({
      severity: "warning",
      code: "faq_items_empty",
      message: "FAQに質問がありません",
      cardId: card.id,
    });
  }
}

function checkImage(card: EditorCard, out: PageQualityFinding[]): void {
  if (card.type !== "image") return;
  const c = card.content ?? {};
  if (!hasMediaSrc(c.src) && !hasMediaSrc(c.image)) {
    out.push({
      severity: "error",
      code: "image_src_missing",
      message: "画像がありません",
      cardId: card.id,
    });
  }
}

function checkLiveOpsCrowd(
  card: EditorCard,
  staleMs: number,
  nowMs: number,
  out: PageQualityFinding[],
): void {
  const key = liveOpsKeyForCardType(card.type);
  if (!key) return;
  const level = coerceLiveOpsLevel(card.content?.level);
  if (level === "closed") return;

  const updatedMs = liveOpsUpdatedAtMs(card.content?.updatedAt);
  const label = getLiveOpsDefinition(key).defaultTitle;
  if (!updatedMs) {
    out.push({
      severity: "warning",
      code: "live_ops_updated_at_missing",
      message: `${label}の最終更新がありません`,
      cardId: card.id,
    });
    return;
  }
  if (nowMs - updatedMs > staleMs) {
    const hours = Math.max(1, Math.round(staleMs / (60 * 60 * 1000)));
    out.push({
      severity: "warning",
      code: "live_ops_stale",
      message: `${label}が${hours}時間以上更新されていません`,
      cardId: card.id,
    });
  }
}

function checkGuestNav(
  guestShell: GuestShellConfig | null | undefined,
  known: Set<string> | null,
  out: PageQualityFinding[],
): void {
  if (!guestShell || getGuestShellNavStyle(guestShell) === "off") return;
  let emptySlug = 0;
  let unknownSlug = 0;
  let emptyPhone = 0;
  for (const tab of guestShell.tabs) {
    if (!tab.enabled || tab.type === "locale" || tab.type === "home") continue;
    if (tab.type === "phone") {
      if (!tab.phone?.trim()) emptyPhone += 1;
      continue;
    }
    if (tab.type === "page") {
      const slug = tab.pageSlug?.trim() ?? "";
      if (!slug) {
        emptySlug += 1;
        continue;
      }
      if (known && !known.has(slug)) unknownSlug += 1;
    }
  }
  if (emptySlug > 0) {
    out.push({
      severity: "error",
      code: "guest_nav_page_slug_empty",
      message:
        emptySlug === 1
          ? "ゲストナビのページ先が未設定です"
          : `ゲストナビのページ先が未設定です（${emptySlug}件）`,
    });
  }
  if (unknownSlug > 0) {
    out.push({
      severity: "error",
      code: "guest_nav_page_slug_unknown",
      message:
        unknownSlug === 1
          ? "ゲストナビに存在しないページがあります"
          : `ゲストナビに存在しないページがあります（${unknownSlug}件）`,
    });
  }
  if (emptyPhone > 0) {
    out.push({
      severity: "error",
      code: "guest_nav_phone_empty",
      message: "ゲストナビの電話番号が空です",
    });
  }
}

function checkPageEmptiness(cards: EditorCard[], out: PageQualityFinding[]): void {
  if (cards.length === 0) {
    out.push({
      severity: "warning",
      code: "page_zero_cards",
      message: "ブロックが1つもありません",
    });
    return;
  }
  const contentCards = cards.filter((c) => !LAYOUT_ONLY.has(c.type));
  if (contentCards.length === 0) {
    out.push({
      severity: "warning",
      code: "page_layout_only",
      message: "余白・区切り以外のブロックがありません",
    });
    return;
  }
  if (contentCards.every(isCardVisuallyEmpty)) {
    out.push({
      severity: "warning",
      code: "page_only_empty_text",
      message: "本文が入ったブロックがありません",
    });
  }
}

function checkConsecutiveSpace(cards: EditorCard[], out: PageQualityFinding[]): void {
  let run = 0;
  let firstId: string | undefined;
  for (const card of cards) {
    if (card.type === "space") {
      if (run === 0) firstId = card.id;
      run += 1;
      if (run === 2) {
        out.push({
          severity: "warning",
          code: "consecutive_empty_space",
          message: "余白ブロックが連続しています",
          cardId: firstId,
        });
        return;
      }
    } else {
      run = 0;
      firstId = undefined;
    }
  }
}

function checkPageTitle(pageTitle: string | null | undefined, out: PageQualityFinding[]): void {
  if (pageTitle === undefined || pageTitle === null) return;
  const trimmed = pageTitle.trim();
  if (!trimmed) {
    out.push({
      severity: "warning",
      code: "page_title_empty",
      message: "ページタイトルが空です",
    });
  }
}

function checkDuplicateLiveOps(cards: EditorCard[], out: PageQualityFinding[]): void {
  const counts = new Map<LiveOpsKey, { count: number; firstId: string }>();
  for (const card of cards) {
    const key = liveOpsKeyForCardType(card.type);
    if (!key) continue;
    const prev = counts.get(key);
    if (prev) {
      prev.count += 1;
    } else {
      counts.set(key, { count: 1, firstId: card.id });
    }
  }
  for (const [key, { count, firstId }] of counts) {
    if (count < 2) continue;
    const label = getLiveOpsDefinition(key).defaultTitle;
    out.push({
      severity: "warning",
      code: "live_ops_duplicate",
      message: `${label}が${count}つあります`,
      cardId: firstId,
    });
  }
}

function checkLiveOpsWithoutStatic(cards: EditorCard[], out: PageQualityFinding[]): void {
  const types = new Set(cards.map((c) => c.type));
  for (const pair of LIVE_OPS_STATIC_PAIR) {
    if (!types.has(pair.crowdType as EditorCard["type"])) continue;
    if (types.has(pair.staticType as EditorCard["type"])) continue;
    const first = cards.find((c) => c.type === pair.crowdType);
    out.push({
      severity: "warning",
      code: pair.code,
      message: pair.message,
      cardId: first?.id,
    });
  }
}

/**
 * Run high-signal pre-publish checks. Order: errors first, then warnings.
 * Dedupes identical code+cardId pairs. Caps at MAX_FINDINGS (most important first).
 */
export function runPageQualityChecks(opts: PageQualityCheckOptions): PageQualityFinding[] {
  const {
    cards,
    guestShell = null,
    knownPageSlugs,
    includeMissingTranslations = false,
    liveOpsStaleHours = DEFAULT_LIVE_OPS_STALE_HOURS,
    pageTitle,
    nowMs = Date.now(),
  } = opts;

  const out: PageQualityFinding[] = [];
  const known = knownSlugSet(knownPageSlugs);
  const staleMs = Math.max(1, liveOpsStaleHours) * 60 * 60 * 1000;

  for (const card of cards) {
    checkWifi(card, out);
    checkHero(card, out);
    checkMap(card, out);
    checkNearby(card, out);
    checkEmergency(card, out);
    checkContactHub(card, out);
    checkCheckout(card, out);
    checkBreakfast(card, out);
    checkFaq(card, out);
    checkImage(card, out);
    checkLiveOpsCrowd(card, staleMs, nowMs, out);
  }

  checkGuestNav(guestShell, known, out);
  checkPageTitle(pageTitle, out);
  checkPageEmptiness(cards, out);
  checkConsecutiveSpace(cards, out);
  checkDuplicateLiveOps(cards, out);
  checkLiveOpsWithoutStatic(cards, out);

  if (includeMissingTranslations) {
    const missing = collectMissingTranslationTargets(cards);
    if (missing.length > 0) {
      out.push({
        severity: "warning",
        code: "missing_translations",
        message: `未翻訳が${missing.length}件あります`,
      });
    }
  }

  const seen = new Set<string>();
  const deduped: PageQualityFinding[] = [];
  for (const finding of out) {
    const key = `${finding.code}:${finding.cardId ?? ""}:${finding.message}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(finding);
  }

  deduped.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "error" ? -1 : 1;
    return 0;
  });

  return deduped.slice(0, MAX_FINDINGS);
}

export function pageQualityHasErrors(findings: PageQualityFinding[]): boolean {
  return findings.some((f) => f.severity === "error");
}

export function pageQualitySummaryTitle(
  findings: PageQualityFinding[],
  mode: "publish" | "preview",
): string {
  const errors = findings.filter((f) => f.severity === "error").length;
  if (errors > 0) {
    return mode === "preview" ? "プレビュー前の要修正" : "公開前の要修正";
  }
  return mode === "preview" ? "プレビュー前の確認" : "公開前の確認";
}
