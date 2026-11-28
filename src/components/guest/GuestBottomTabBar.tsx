"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  buildGuestPagePath,
  getGuestShellTabLabel,
  getGuestShellTabLabelForDisplay,
  resolveGuestShellTabIcon,
  toTelHref,
  type GuestShellTab,
} from "@/lib/guest-shell";
import { openGuestNavigationHref } from "@/lib/guest-hard-navigation";
import type { SupportedLocale } from "@/lib/localized-content";
import { GuestShellTabIconGlyph } from "@/components/guest/GuestShellTabIconGlyph";

type GuestBottomTabBarProps = {
  tabs: GuestShellTab[];
  currentSlug: string;
  /** Active locale for tab labels */
  locale: SupportedLocale;
  preview?: boolean;
  clientApp?: boolean;
  /** Editor preview: tabs look active but do not navigate */
  previewMode?: boolean;
};

function TabIcon({ name }: { name: Parameters<typeof GuestShellTabIconGlyph>[0]["name"] }) {
  return <GuestShellTabIconGlyph name={name} className="h-5 w-5" />;
}

function isTabActive(tab: GuestShellTab, currentSlug: string): boolean {
  if (tab.type === "home") {
    return !tab.pageSlug?.trim() || tab.pageSlug === currentSlug;
  }
  if (tab.type === "page") {
    return Boolean(tab.pageSlug?.trim()) && tab.pageSlug === currentSlug;
  }
  return false;
}

function scrollGuestPageToTop() {
  const scrollRoot =
    document.querySelector<HTMLElement>("[data-phone-screen] [data-guest-page-shell]") ??
    document.querySelector<HTMLElement>("[data-guest-page-shell]") ??
    document.scrollingElement;
  if (scrollRoot && "scrollTo" in scrollRoot) {
    scrollRoot.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getPhoneSheetCopy(locale: SupportedLocale, title: string) {
  if (locale === "ko") {
    return {
      title,
      canCall: "등록된 연락처로 전화할 수 있습니다",
      call: "전화하기",
      missing: "전화번호가 아직 설정되지 않았습니다.",
      close: "닫기",
    };
  }
  if (locale === "zh") {
    return {
      title,
      canCall: "可拨打已设置的联系电话",
      call: "拨打电话",
      missing: "尚未设置电话号码。",
      close: "关闭",
    };
  }
  if (locale === "en") {
    return {
      title,
      canCall: "You can call the saved contact",
      call: "Call",
      missing: "A phone number has not been set yet.",
      close: "Close",
    };
  }
  return {
    title,
    canCall: "登録された連絡先へ電話できます",
    call: "電話する",
    missing: "電話番号がまだ設定されていません。施設の設定から番号を登録してください。",
    close: "閉じる",
  };
}

/**
 * Facility-wide bottom tab bar for guest pages (Core Guide–style chrome).
 * Language switching is header-only (not a footer tab).
 */
export function GuestBottomTabBar({
  tabs,
  currentSlug,
  locale,
  preview = false,
  clientApp = false,
  previewMode = false,
}: GuestBottomTabBarProps) {
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState<string | null>(null);
  const [phoneTitle, setPhoneTitle] = useState("電話");
  const [overlayHost, setOverlayHost] = useState<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const titleId = useId();

  useEffect(() => {
    const host =
      navRef.current?.closest<HTMLElement>("[data-phone-screen]") ??
      navRef.current?.closest<HTMLElement>("[data-guest-page-shell]") ??
      null;
    setOverlayHost(host);
  }, []);

  useEffect(() => {
    if (!phoneOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhoneOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phoneOpen]);

  if (tabs.length === 0) return null;

  const activeTabClass = "text-[#2D7078] font-semibold";
  const inactiveTabClass = "text-slate-500 font-medium active:bg-slate-50";
  const disabledTabClass = "cursor-not-allowed text-slate-300";
  const containOverlays = Boolean(overlayHost);
  const overlayPositionClass = containOverlays ? "absolute" : "fixed";

  function openPhoneSheet(tab: GuestShellTab) {
    const host =
      navRef.current?.closest<HTMLElement>("[data-phone-screen]") ??
      navRef.current?.closest<HTMLElement>("[data-guest-page-shell]") ??
      null;
    if (host) setOverlayHost(host);
    setPhoneTitle(getGuestShellTabLabel(tab, locale) || "電話");
    setPhoneValue(tab.phone?.trim() || null);
    setPhoneOpen(true);
  }

  function handleTab(tab: GuestShellTab) {
    if (tab.type === "locale") return;
    if (previewMode) {
      if (tab.type === "phone") openPhoneSheet(tab);
      return;
    }
    if (tab.type === "phone") {
      openPhoneSheet(tab);
      return;
    }
    const slug = tab.type === "home" ? (tab.pageSlug?.trim() || currentSlug) : tab.pageSlug?.trim();
    if (!slug) return;
    if (slug === currentSlug) {
      scrollGuestPageToTop();
      return;
    }
    const href = buildGuestPagePath(slug, {
      preview,
      clientApp,
      lang: locale !== "ja" ? locale : null,
    });
    openGuestNavigationHref(href);
  }

  const telHref = phoneValue ? toTelHref(phoneValue) : null;
  const phoneSheetCopy = getPhoneSheetCopy(locale, phoneTitle);

  function renderOverlay(node: ReactNode) {
    if (containOverlays && overlayHost) {
      return createPortal(node, overlayHost);
    }
    return node;
  }

  return (
    <>
      <nav
        ref={navRef}
        className="guest-bottom-tabs shrink-0 border-t border-slate-200/90 bg-white/95 backdrop-blur-sm"
        style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
        aria-label="館内ナビ"
      >
        <div className="mx-auto flex max-w-[420px] items-stretch justify-around gap-0.5 px-1 pt-1">
          {tabs.map((tab) => {
            if (tab.type === "locale") return null;
            const active = isTabActive(tab, currentSlug);
            const disabled =
              (tab.type === "page" && !tab.pageSlug?.trim()) ||
              (tab.type === "phone" && !tab.phone?.trim());
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTab(tab)}
                disabled={!previewMode && disabled && tab.type !== "phone"}
                className={
                  "ui-pop-tap flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] transition-colors " +
                  (active
                    ? activeTabClass
                    : disabled && !previewMode && tab.type !== "phone"
                      ? disabledTabClass
                      : inactiveTabClass)
                }
                aria-current={active ? "page" : undefined}
              >
                <TabIcon name={resolveGuestShellTabIcon(tab)} />
                <span className="max-w-full truncate">
                  {getGuestShellTabLabelForDisplay(tab, locale, { clientApp })}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {phoneOpen
        ? renderOverlay(
            <div
              className={`${overlayPositionClass} inset-0 z-[100] flex items-end justify-center bg-slate-900/40`}
              role="presentation"
            >
              <button
                type="button"
                className="absolute inset-0 cursor-default"
                aria-label={phoneSheetCopy.close}
                onClick={() => setPhoneOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${titleId}-phone`}
                className={
                  "relative z-[1] w-full rounded-t-2xl border border-b-0 border-slate-200 bg-white p-4 shadow-[0_-8px_28px_rgba(15,23,42,0.14)] ui-pop-in " +
                  (containOverlays ? "" : "max-w-[420px]")
                }
                style={{
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
                }}
              >
                <h2 id={`${titleId}-phone`} className="text-base font-semibold text-slate-900">
                  {phoneSheetCopy.title}
                </h2>
                {phoneValue && telHref ? (
                  <>
                    <p className="mt-2 text-sm text-slate-600">{phoneSheetCopy.canCall}</p>
                    <p className="mt-1 break-all text-lg font-semibold tracking-wide text-slate-900">
                      {phoneValue}
                    </p>
                    <a
                      href={telHref}
                      className="ui-pop-tap mt-4 flex min-h-[48px] items-center justify-center rounded-xl bg-[#2D7078] px-4 text-sm font-semibold !text-white"
                      style={{ color: "#ffffff" }}
                    >
                      {phoneSheetCopy.call}
                    </a>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">{phoneSheetCopy.missing}</p>
                )}
                <button
                  type="button"
                  onClick={() => setPhoneOpen(false)}
                  className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {phoneSheetCopy.close}
                </button>
              </div>
            </div>,
          )
        : null}
    </>
  );
}
