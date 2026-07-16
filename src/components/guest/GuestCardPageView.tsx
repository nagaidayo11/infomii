"use client";

import type { FormEvent, MouseEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import type { EditorCard } from "@/components/editor/types";
import { CardRenderer } from "@/components/cards/CardRenderer";
import { LocaleProvider } from "@/components/locale-context";
import { PublicPageShell } from "@/components/public-page/PublicPageShell";
import { GuestBottomTabBar } from "@/components/guest/GuestBottomTabBar";
import { GuestHamburgerMenu } from "@/components/guest/GuestHamburgerMenu";
import { GuestLanguageToggle } from "@/components/guest/GuestLanguageToggle";
import { normalizeLocale, type SupportedLocale } from "@/lib/localized-content";
import {
  getGuestShellNavStyle,
  resolveVisibleGuestShellTabs,
  type GuestShellConfig,
} from "@/lib/guest-shell";
import {
  GUEST_CARD_STACK_CLASS,
  GUEST_CARD_STACK_FLUSH_CLASS,
} from "@/lib/editor/card-width-mode";
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
  /**
   * @deprecated Language is always the header Language + dropdown control.
   * Kept for call-site compatibility; ignored.
   */
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

  const triggerLocaleHint = () => {
    if (localeToggleHint?.trim()) {
      setHintNonce((prev) => prev + 1);
      setHintVisible(true);
    }
  };

  const onLocaleChange = (next: SupportedLocale) => {
    if (!disableLocaleSwitch) setLocale(next);
    triggerLocaleHint();
  };

  const localeToggleActions = showLocaleToggle ? (
    <GuestLanguageToggle locale={locale} onLocaleChange={onLocaleChange} onHint={triggerLocaleHint} />
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
        preview={preview}
        clientApp={clientApp}
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
      preview={preview}
      clientApp={clientApp}
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
              (contentInset === "flush" ? "mx-3.5 mt-3" : "card-content-inset")
            }
            style={{ animationDuration: "2s" }}
          >
            {localeToggleHint}
          </div>
        )}
        <div
          className={contentInset === "flush" ? GUEST_CARD_STACK_FLUSH_CLASS : GUEST_CARD_STACK_CLASS}
          onClickCapture={stopInteractiveAction}
          onSubmitCapture={stopInteractiveAction}
          aria-disabled={disableInteractions || undefined}
        >
          <CardRenderer cards={cards} businessFeaturesEnabled={businessFeaturesEnabled} />
        </div>
      </PublicPageShell>
    </LocaleProvider>
  );
}
