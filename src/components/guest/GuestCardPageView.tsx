"use client";

import { useEffect, useState } from "react";
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

  const headerActions = (
    <div className="flex items-center justify-end gap-2">
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
          <CardRenderer cards={cards} />
        </div>
      </PublicPageShell>
    </LocaleProvider>
  );
}
