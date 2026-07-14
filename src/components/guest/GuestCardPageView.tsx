"use client";

import type { FormEvent, MouseEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { LocaleProvider } from "@/components/locale-context";
import { PublicPageShell } from "@/components/public-page/PublicPageShell";
import { GuestBottomTabBar } from "@/components/guest/GuestBottomTabBar";
import { GuestHamburgerMenu } from "@/components/guest/GuestHamburgerMenu";
import { normalizeLocale, type SupportedLocale } from "@/lib/localized-content";
import {
  getGuestShellNavStyle,
  resolveVisibleGuestShellTabs,
  type GuestShellConfig,
} from "@/lib/guest-shell";
import type { PageBackgroundStyle } from "@/lib/storage";

type GuestCardPageViewProps = {
  title: string;
  cards: EditorCard[];
  initialLocale: SupportedLocale;
  /** `?lang=xx` 指定時はブラウザ言語で上書きしない */
  localeLocked?: boolean;
  /** LP iframe などの埋め込み表示 */
  isEmbed?: boolean;
  /** Flush nesting for CSS phone shells (avoids double border-radius). */
  embedFit?: "card" | "device";
  pageBackground?: PageBackgroundStyle | null;
  unpublishedPreview?: boolean;
  /** 言語トグル押下時の軽い案内ポップ（LPデモ用） */
  localeToggleHint?: string | null;
  /** true のとき言語トグルで実際の表示言語は変更しない（デモ用） */
  disableLocaleSwitch?: boolean;
  /** false のとき言語トグル自体を表示しない */
  showLocaleToggle?: boolean;
  /** Header locale control: compact pills vs globe+Language (hospitality home). */
  localeToggleVariant?: "pills" | "language";
  /** Circular brand mark in page header */
  brandLogoSrc?: string | null;
  /** true のとき Business 動的機能を有効化 */
  businessFeaturesEnabled?: boolean;
  /** Free: fewer links. Omit = no extra cap beyond config. */
  guestNavMaxVisible?: number;
  /** Optional back button (for child pages). */
  backButton?: ReactNode;
  /** true のときリンク・ボタンなどの操作を無効化（LP埋め込みプレビュー用） */
  disableInteractions?: boolean;
  /** Facility-wide guest nav config */
  guestShell?: GuestShellConfig | null;
  /** Current page slug (for active tab + navigation) */
  currentSlug?: string;
  /** Preview mode for guest links */
  preview?: boolean;
  /** App WebView client */
  clientApp?: boolean;
  /** Edge-to-edge hero/list (hospitality home). */
  contentInset?: "default" | "flush";
};

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5 0 4.5-4 4.5-9S14.5 3 12 3 7.5 7 7.5 12s2 9 4.5 9zm-7.5-9h15"
      />
    </svg>
  );
}

/**
 * Public view of a card-based page. Detects visitor language and falls back to English.
 */
export function GuestCardPageView({
  title,
  cards,
  initialLocale,
  localeLocked = false,
  isEmbed = false,
  embedFit = "card",
  pageBackground = null,
  unpublishedPreview = false,
  localeToggleHint = null,
  disableLocaleSwitch = false,
  showLocaleToggle = true,
  localeToggleVariant = "pills",
  brandLogoSrc = null,
  businessFeaturesEnabled = false,
  guestNavMaxVisible,
  backButton,
  disableInteractions = false,
  guestShell = null,
  currentSlug = "",
  preview = false,
  clientApp = false,
  contentInset = "default",
}: GuestCardPageViewProps) {
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    if (localeLocked || typeof navigator === "undefined") return initialLocale;
    const normalized = normalizeLocale(navigator.language);
    return normalized ?? initialLocale;
  });
  const [hintVisible, setHintVisible] = useState(false);
  const [hintNonce, setHintNonce] = useState(0);
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);

  const navStyle = guestShell ? getGuestShellNavStyle(guestShell) : "off";
  const shellTabs = useMemo(
    () =>
      guestShell
        ? resolveVisibleGuestShellTabs(guestShell, {
            businessFeaturesEnabled,
            maxVisibleTabs: guestNavMaxVisible,
          })
        : [],
    [guestShell, businessFeaturesEnabled, guestNavMaxVisible],
  );
  // Visible locale tab only (plan-gated); avoid double language chrome.
  const shellHasLocaleTab = shellTabs.some((tab) => tab.type === "locale");
  const showHeaderLocaleToggle = showLocaleToggle && !shellHasLocaleTab;

  const locales: Array<{ code: SupportedLocale; label: string }> = [
    { code: "ja", label: "JA" },
    { code: "en", label: "EN" },
    { code: "zh", label: "中文" },
    { code: "ko", label: "한국어" },
  ];

  const onLocaleFromNav = (next: SupportedLocale) => {
    if (!disableLocaleSwitch) setLocale(next);
    if (localeToggleHint?.trim()) {
      setHintNonce((prev) => prev + 1);
      setHintVisible(true);
    }
  };

  const triggerLocaleHint = () => {
    if (localeToggleHint?.trim()) {
      setHintNonce((prev) => prev + 1);
      setHintVisible(true);
    }
  };

  const localeToggleActions = showHeaderLocaleToggle ? (
    localeToggleVariant === "language" ? (
      <button
        type="button"
        onClick={() => {
          setLanguageSheetOpen(true);
          triggerLocaleHint();
        }}
        className="ui-pop-tap inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-[12px] font-medium text-slate-600 transition hover:text-slate-900"
        aria-label="Language"
      >
        <GlobeIcon className="h-4 w-4" />
        <span>Language</span>
      </button>
    ) : (
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
                triggerLocaleHint();
              }}
              className={
                "ui-pop-tap whitespace-nowrap rounded-md border px-2 py-1 text-[11px] leading-none transition " +
                (active
                  ? "border-slate-900 bg-slate-900 !text-white font-semibold"
                  : "border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-50")
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
    )
  ) : null;

  const hamburgerMenu =
    !disableInteractions &&
    navStyle === "hamburger" &&
    shellTabs.length > 0 &&
    currentSlug ? (
      <GuestHamburgerMenu
        tabs={shellTabs}
        currentSlug={currentSlug}
        locale={locale}
        onLocaleChange={onLocaleFromNav}
        preview={preview}
        clientApp={clientApp}
        localeHint={localeToggleHint}
        contained
      />
    ) : null;

  const headerActions =
    localeToggleActions || hamburgerMenu ? (
      <div className="flex flex-nowrap items-center justify-end gap-2">
        {localeToggleActions}
        {hamburgerMenu}
      </div>
    ) : null;

  const stopInteractiveAction = (event: MouseEvent<HTMLDivElement> | FormEvent<HTMLDivElement>) => {
    if (!disableInteractions) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const actionable = target.closest("a, button, input, select, textarea, [role='button'], form");
    if (!actionable) return;
    // Allow locale chrome in the header even when page interactions are locked.
    if (target.closest("[data-guest-header]")) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const showBottomTabs = navStyle === "tabs" && shellTabs.length > 0;
  const bottomChrome = showBottomTabs ? (
    <GuestBottomTabBar
      tabs={shellTabs}
      currentSlug={currentSlug || shellTabs.find((t) => t.type === "home")?.pageSlug || ""}
      locale={locale}
      onLocaleChange={onLocaleFromNav}
      preview={preview}
      clientApp={clientApp}
      localeHint={localeToggleHint}
      previewMode={isEmbed || disableInteractions || preview}
    />
  ) : null;

  return (
    <LocaleProvider value={locale}>
      <PublicPageShell
        title={title}
        brandLogoSrc={brandLogoSrc}
        backButton={backButton}
        pageBackground={pageBackground}
        headerActions={headerActions}
        bottomChrome={bottomChrome}
        isEmbed={isEmbed}
        embedFit={embedFit}
        hardNavigation={!disableInteractions}
        contentInset={contentInset}
      >
        {hintVisible && localeToggleHint && (
          <div
            key={hintNonce}
            onAnimationEnd={() => setHintVisible(false)}
            className={
              "toast-slide-in-out rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs leading-relaxed text-teal-900 " +
              (contentInset === "flush" ? "mx-3.5 mt-3" : "")
            }
            style={{ animationDuration: "2s" }}
          >
            {localeToggleHint}
          </div>
        )}
        <div
          className={contentInset === "flush" ? "space-y-0" : "space-y-4"}
          onClickCapture={stopInteractiveAction}
          onSubmitCapture={stopInteractiveAction}
          aria-disabled={disableInteractions || undefined}
        >
          {unpublishedPreview && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              現在公開OFFになっています（これはプレビュー表示です）。
            </div>
          )}
          <CardRenderer cards={cards} businessFeaturesEnabled={businessFeaturesEnabled} />
        </div>
      </PublicPageShell>

      {languageSheetOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 p-3 sm:items-center" role="presentation">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="閉じる"
            onClick={() => setLanguageSheetOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Language"
            className="relative z-[1] w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <h2 className="text-base font-semibold text-slate-900">Language</h2>
            <p className="mt-1 text-xs text-slate-500">表示言語を選んでください</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(
                [
                  { code: "ja", label: "日本語" },
                  { code: "en", label: "English" },
                  { code: "zh", label: "中文" },
                  { code: "ko", label: "한국어" },
                ] as const
              ).map((item) => {
                const active = locale === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      onLocaleFromNav(item.code);
                      setLanguageSheetOpen(false);
                    }}
                    className={
                      "ui-pop-tap rounded-xl border px-3 py-3 text-sm font-medium transition " +
                      (active
                        ? "border-teal-700 bg-[#2D7078] !text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50")
                    }
                    style={active ? { color: "#ffffff" } : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setLanguageSheetOpen(false)}
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              閉じる
            </button>
          </div>
        </div>
      ) : null}
    </LocaleProvider>
  );
}
