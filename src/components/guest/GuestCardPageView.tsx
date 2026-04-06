"use client";

import { useState } from "react";
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
  /** `?lang=xx` 指定時はブラウザ言語で上書きしない */
  localeLocked?: boolean;
  /** LP iframe などの埋め込み表示 */
  isEmbed?: boolean;
  pageBackground?: PageBackgroundStyle | null;
  unpublishedPreview?: boolean;
  /** 言語トグル押下時の軽い案内ポップ（LPデモ用） */
  localeToggleHint?: string | null;
  /** true のとき言語トグルで実際の表示言語は変更しない（デモ用） */
  disableLocaleSwitch?: boolean;
  /** false のとき言語トグル自体を表示しない */
  showLocaleToggle?: boolean;
};

/**
 * Public view of a card-based page. Detects visitor language and falls back to English.
 */
export function GuestCardPageView({
  title,
  cards,
  initialLocale,
  localeLocked = false,
  isEmbed = false,
  pageBackground = null,
  unpublishedPreview = false,
  localeToggleHint = null,
  disableLocaleSwitch = false,
  showLocaleToggle = true,
}: GuestCardPageViewProps) {
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    if (localeLocked || typeof navigator === "undefined") return initialLocale;
    const normalized = normalizeLocale(navigator.language);
    return normalized ?? initialLocale;
  });
  const [hintVisible, setHintVisible] = useState(false);

  const locales: Array<{ code: SupportedLocale; label: string }> = [
    { code: "ja", label: "JA" },
    { code: "en", label: "EN" },
    { code: "zh", label: "中文" },
    { code: "ko", label: "한국어" },
  ];

  const headerActions = showLocaleToggle ? (
    <div className="flex flex-nowrap items-center justify-end gap-1">
      {locales.map((item) => {
        const active = locale === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => {
              if (!disableLocaleSwitch) {
                setLocale(item.code);
              }
              if (localeToggleHint && localeToggleHint.trim().length > 0) {
                setHintVisible(true);
                if (typeof window !== "undefined") {
                  window.setTimeout(() => setHintVisible(false), 4000);
                }
              }
            }}
            className={
              "whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium leading-none transition " +
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
  ) : null;

  return (
    <LocaleProvider value={locale}>
      <PublicPageShell
        title={title}
        pageBackground={pageBackground}
        headerActions={headerActions}
        isEmbed={isEmbed}
      >
        {hintVisible && localeToggleHint && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-900">
            {localeToggleHint}
          </div>
        )}
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
