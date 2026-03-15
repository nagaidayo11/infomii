/**
 * カードの多言語対応。
 * フィールドは文字列のままか、言語キー付きオブジェクトで保存できる。
 *
 * 例: content: { ja: "テキスト", en: "Text", zh: "文本", ko: "텍스트" }
 */

export const SUPPORTED_LOCALES = ["ja", "en", "zh", "ko"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LocalizedString =
  | string
  | { ja?: string; en?: string; zh?: string; ko?: string };

const FALLBACK_ORDER: SupportedLocale[] = ["ja", "en", "zh", "ko"];

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
 * ローカル文字列または通常の文字列から、指定言語の表示用文字列を取得する。
 * - value がオブジェクトの場合: 指定 locale → ja → en → 先頭キー の順でフォールバック
 * - value が文字列の場合: そのまま返す（従来の単一言語データとの互換）
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
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return "";
}
