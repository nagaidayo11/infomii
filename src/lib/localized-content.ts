/**
 * カードの多言語対応。
 * フィールドは文字列のままか、言語キー付きオブジェクトで保存できる。
 *
 * Card content structure (canonical):
 * { ja: "...", en: "...", zh: "...", ko: "..." }
 *
 * Visitor language is detected automatically; fallback is always English (en).
 */

export const SUPPORTED_LOCALES = ["ja", "en", "zh", "ko"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Canonical multilingual content: one key per supported language. */
export type LocalizedContent = {
  ja?: string;
  en?: string;
  zh?: string;
  ko?: string;
};

export type LocalizedString = string | LocalizedContent;

/** Fallback order when a value is missing: always prefer English, then ja, zh, ko. */
const FALLBACK_ORDER: SupportedLocale[] = ["en", "ja", "zh", "ko"];

/**
 * 言語コードを正規化（例: "en-US" → "en"）。
 * 対応外の場合は null を返す。
 */
export function normalizeLocale(lang: string): SupportedLocale | null {
  const code = lang.split("-")[0].toLowerCase();
  if (SUPPORTED_LOCALES.includes(code as SupportedLocale)) {
    return code as SupportedLocale;
  }
  return null;
}

/**
 * Detect visitor locale from Accept-Language header (server-side).
 * Returns supported locale or "en" as fallback.
 */
export function getVisitorLocaleFromHeader(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage || typeof acceptLanguage !== "string") return "en";
  const parts = acceptLanguage.split(",").map((p) => p.split(";")[0].trim());
  for (const part of parts) {
    const normalized = normalizeLocale(part);
    if (normalized) return normalized;
  }
  return "en";
}

/**
 * Get display string for a locale. Fallback order: requested locale → en → ja → zh → ko.
 * - Object: use preferred locale, then English, then others.
 * - String: return as-is (backward compatible).
 */
export function getLocalizedContent(
  value: LocalizedString | undefined | null,
  locale: string
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;

  const preferred = normalizeLocale(locale);
  const keys = preferred
    ? [preferred, ...FALLBACK_ORDER.filter((k) => k !== preferred)]
    : [...FALLBACK_ORDER];

  for (const key of keys) {
    const v = value[key];
    if (v == null) continue;
    if (typeof v === "string" && v.trim() !== "") return v;
    if (typeof v === "number" && String(v).trim() !== "") return String(v);
    /* 誤ってオブジェクトが入った場合は String() せずスキップ（[object Object] を防ぐ） */
  }
  return "";
}
