"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { LocaleProvider } from "@/components/locale-context";
import { PublicPageShell } from "@/components/public-page/PublicPageShell";
import { normalizeLocale, type SupportedLocale } from "@/lib/localized-content";
import type { PageBackgroundStyle } from "@/lib/storage";

type GuestCardPageViewProps = {
  title: string;
  cards: EditorCard[];
  initialLocale: SupportedLocale;
  pageBackground?: PageBackgroundStyle | null;
  unpublishedPreview?: boolean;
};

/**
 * Public view of a card-based page. Detects visitor language and falls back to English.
 */
export function GuestCardPageView({
  title,
  cards,
  initialLocale,
  pageBackground = null,
  unpublishedPreview = false,
}: GuestCardPageViewProps) {
  const [locale, setLocale] = useState<SupportedLocale>(initialLocale);
  const [renderCards, setRenderCards] = useState<EditorCard[]>(cards);
  const [translating, setTranslating] = useState(false);
  const translationCacheRef = useRef<Map<string, { en: string; zh: string; ko: string } | null>>(new Map());

  useEffect(() => {
    const raw = typeof navigator !== "undefined" ? navigator.language : "";
    const normalized = normalizeLocale(raw);
    if (normalized) {
      setLocale(normalized);
    }
  }, []);

  const locales: Array<{ code: SupportedLocale; label: string }> = [
    { code: "ja", label: "JA" },
    { code: "en", label: "EN" },
    { code: "zh", label: "中文" },
    { code: "ko", label: "한국어" },
  ];

  const nonTranslatableKeys = useMemo(
    () =>
      new Set([
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
      ]),
    []
  );

  useEffect(() => {
    let cancelled = false;
    if (locale === "ja") {
      setRenderCards(cards);
      setTranslating(false);
      return () => {
        cancelled = true;
      };
    }

    async function translateJaToEnZhKo(text: string): Promise<{ en: string; zh: string; ko: string } | null> {
      const cacheKey = text.trim();
      if (translationCacheRef.current.has(cacheKey)) {
        return translationCacheRef.current.get(cacheKey) ?? null;
      }
      try {
        const res = await fetch("/api/ai/translate-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) {
          translationCacheRef.current.set(cacheKey, null);
          return null;
        }
        const data = (await res.json()) as { en?: string; zh?: string; ko?: string };
        const valid =
          typeof data.en === "string" &&
          typeof data.zh === "string" &&
          typeof data.ko === "string"
            ? { en: data.en, zh: data.zh, ko: data.ko }
            : null;
        translationCacheRef.current.set(cacheKey, valid);
        return valid;
      } catch {
        translationCacheRef.current.set(cacheKey, null);
        return null;
      }
    }

    async function walk(value: unknown, key?: string): Promise<unknown> {
      if (typeof value === "string") {
        const ja = value.trim();
        if (!ja || (key && nonTranslatableKeys.has(key)) || /^https?:\/\//i.test(ja)) return value;
        const translated = await translateJaToEnZhKo(ja);
        if (!translated) return value;
        if (locale === "en") return translated.en;
        if (locale === "zh") return translated.zh;
        if (locale === "ko") return translated.ko;
        return value;
      }
      if (Array.isArray(value)) {
        return Promise.all(value.map((item) => walk(item, key)));
      }
      if (value && typeof value === "object") {
        const entries = await Promise.all(
          Object.entries(value as Record<string, unknown>).map(async ([k, v]) => [k, await walk(v, k)] as const)
        );
        return Object.fromEntries(entries);
      }
      return value;
    }

    async function run() {
      setTranslating(true);
      const translated = await Promise.all(
        cards.map(async (card) => ({
          ...card,
          content: (await walk(card.content)) as Record<string, unknown>,
        }))
      );
      if (!cancelled) {
        setRenderCards(translated);
        setTranslating(false);
      }
    }

    run();
    return () => {
      cancelled = true;
      setTranslating(false);
    };
  }, [cards, locale, nonTranslatableKeys]);

  const headerActions = (
    <div className="flex items-center justify-end gap-2">
      {translating && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          翻訳中...
        </span>
      )}
      {locales.map((item) => {
        const active = locale === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLocale(item.code)}
            className={
              "rounded-md border px-2.5 py-1 text-xs font-medium transition " +
              (active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
            }
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <LocaleProvider value={locale}>
      <PublicPageShell title={title} pageBackground={pageBackground} headerActions={headerActions}>
        <div className="space-y-4">
          {unpublishedPreview && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              現在公開OFFになっています（これはプレビュー表示です）。
            </div>
          )}
          <CardRenderer cards={renderCards} />
        </div>
      </PublicPageShell>
    </LocaleProvider>
  );
}
