/**
 * Batch-translate card content JA → EN/ZH/KO via /api/ai/translate-content.
 * Used on publish / preview for Business plan (not on every keystroke).
 */

import { getLocalizedContent, type LocalizedString } from "@/lib/localized-content";
import type { EditorCard } from "@/components/editor/types";

const NON_TRANSLATABLE_KEYS = new Set([
  "href",
  "link",
  "linkUrl",
  "src",
  "mapEmbedUrl",
  "pageSlug",
  "icon",
  "variant",
  "style",
  "color",
  "accent",
  "iconSize",
  "styleVariant",
  "tileShadowStrength",
  "circleIconShadowStrength",
  "columns",
  "linkType",
]);

function collectJaTargets(
  value: unknown,
  key: string | undefined,
  out: Set<string>,
  onlyMissingLocales: boolean,
): void {
  if (typeof value === "string") {
    const ja = value.trim();
    if (!ja || (key && NON_TRANSLATABLE_KEYS.has(key)) || /^https?:\/\//i.test(ja) || ja.length < 2) {
      return;
    }
    out.add(ja);
    return;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const localized = value as Record<string, unknown>;
    if ("ja" in localized || "en" in localized || "zh" in localized || "ko" in localized) {
      const ja = getLocalizedContent(localized as LocalizedString, "ja").trim();
      if (!ja || ja.length < 2 || /^https?:\/\//i.test(ja)) return;
      if (onlyMissingLocales) {
        const missing = (["en", "zh", "ko"] as const).some((locale) => {
          const val = localized[locale];
          return typeof val !== "string" || val.trim().length === 0;
        });
        if (!missing) return;
      }
      out.add(ja);
      return;
    }
    for (const [k, v] of Object.entries(localized)) {
      collectJaTargets(v, k, out, onlyMissingLocales);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectJaTargets(item, key, out, onlyMissingLocales);
  }
}

async function translateBatch(
  targets: string[],
  cache: Map<string, { en: string; zh: string; ko: string }>,
): Promise<void> {
  if (targets.length === 0) return;
  // API accepts up to 120 texts; chunk defensively.
  const CHUNK = 80;
  for (let start = 0; start < targets.length; start += CHUNK) {
    const slice = targets.slice(start, start + CHUNK);
    const res = await fetch("/api/ai/translate-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: slice }),
    });
    if (!res.ok) throw new Error("batch translate failed");
    const data = (await res.json()) as {
      items?: Array<{ i: number; en: string; zh: string; ko: string }>;
    };
    for (const item of Array.isArray(data.items) ? data.items : []) {
      const source = slice[item.i];
      if (!source) continue;
      if (typeof item.en === "string" && typeof item.zh === "string" && typeof item.ko === "string") {
        cache.set(source, { en: item.en, zh: item.zh, ko: item.ko });
      }
    }
  }
}

function applyTranslations(
  value: unknown,
  key: string | undefined,
  cache: Map<string, { en: string; zh: string; ko: string }>,
): { value: unknown; count: number } {
  if (typeof value === "string") {
    const ja = value.trim();
    if (!ja || (key && NON_TRANSLATABLE_KEYS.has(key)) || /^https?:\/\//i.test(ja) || ja.length < 2) {
      return { value, count: 0 };
    }
    const translated = cache.get(ja);
    if (!translated) return { value, count: 0 };
    return { value: { ja: value, en: translated.en, zh: translated.zh, ko: translated.ko }, count: 1 };
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const localized = value as Record<string, unknown>;
    if ("ja" in localized || "en" in localized || "zh" in localized || "ko" in localized) {
      const ja = getLocalizedContent(localized as LocalizedString, "ja");
      const translated = cache.get(ja.trim());
      if (!translated) return { value, count: 0 };
      return {
        value: { ...localized, ja, en: translated.en, zh: translated.zh, ko: translated.ko },
        count: 1,
      };
    }
    const next: Record<string, unknown> = {};
    let total = 0;
    for (const [k, v] of Object.entries(localized)) {
      const result = applyTranslations(v, k, cache);
      next[k] = result.value;
      total += result.count;
    }
    return { value: next, count: total };
  }
  if (Array.isArray(value)) {
    const next: unknown[] = [];
    let total = 0;
    for (const item of value) {
      const result = applyTranslations(item, key, cache);
      next.push(result.value);
      total += result.count;
    }
    return { value: next, count: total };
  }
  return { value, count: 0 };
}

/** Collect JA strings that still need EN/ZH/KO. */
export function collectMissingTranslationTargets(cards: EditorCard[]): string[] {
  const set = new Set<string>();
  for (const card of cards) {
    collectJaTargets(card.content, undefined, set, true);
  }
  return Array.from(set);
}

/**
 * Translate missing locales on all cards. Returns updated cards + how many fields were filled.
 * One API round-trip (chunked) for the whole page — not per keystroke.
 */
export async function batchTranslateEditorCards(
  cards: EditorCard[],
): Promise<{ cards: EditorCard[]; translatedCount: number }> {
  if (cards.length === 0) return { cards, translatedCount: 0 };

  const targets = collectMissingTranslationTargets(cards);
  if (targets.length === 0) return { cards, translatedCount: 0 };

  const cache = new Map<string, { en: string; zh: string; ko: string }>();
  await translateBatch(targets, cache);

  let translatedCount = 0;
  const nextCards = cards.map((card) => {
    const result = applyTranslations(card.content, undefined, cache);
    translatedCount += result.count;
    return { ...card, content: result.value as Record<string, unknown> };
  });

  return { cards: nextCards, translatedCount };
}
