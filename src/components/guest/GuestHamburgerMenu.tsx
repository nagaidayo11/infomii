"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  buildGuestPagePath,
  getGuestShellTabLabel,
  toTelHref,
  type GuestShellTab,
} from "@/lib/guest-shell";
import type { SupportedLocale } from "@/lib/localized-content";

type GuestHamburgerMenuProps = {
  tabs: GuestShellTab[];
  currentSlug: string;
  locale: SupportedLocale;
  preview?: boolean;
  clientApp?: boolean;
  /** Editor preview: open panels but do not navigate */
  previewMode?: boolean;
  /**
   * Keep overlays inside the phone mock (`[data-phone-screen]`).
   * Defaults to true when `previewMode` is on.
   */
  contained?: boolean;
};

function MenuIcon({ type }: { type: GuestShellTab["type"] }) {
  const className = "h-5 w-5 shrink-0";
  if (type === "home") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
      </svg>
    );
  }
  if (type === "phone") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 5a2 2 0 012-2h2.3a1 1 0 01.96.73l1.1 3.7a1 1 0 01-.27 1.05L7.9 10.7a12.05 12.05 0 005.4 5.4l2.22-1.19a1 1 0 011.05-.27l3.7 1.1a1 1 0 01.73.96V19a2 2 0 01-2 2h-.5C10.16 21 3 13.84 3 5.5V5z"
        />
      </svg>
    );
  }
  if (type === "page") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5 0 4.5-4 4.5-9S14.5 3 12 3 7.5 7 7.5 12s2 9 4.5 9zm-7.5-9h15"
      />
    </svg>
  );
}

function isTabActive(tab: GuestShellTab, currentSlug: string): boolean {
  if (tab.type === "home" || tab.type === "page") {
    return Boolean(tab.pageSlug) && tab.pageSlug === currentSlug;
  }
  return false;
}

/**
 * Header hamburger menu for guest pages (exclusive alternative to bottom tabs).
 * Language switching is header-only (not a menu item).
 */
export function GuestHamburgerMenu({
  tabs,
  currentSlug,
  locale,
  preview = false,
  clientApp = false,
  previewMode = false,
  contained,
}: GuestHamburgerMenuProps) {
  const containOverlays = contained ?? previewMode;
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuEntered, setMenuEntered] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState<string | null>(null);
  const [overlayHost, setOverlayHost] = useState<HTMLElement | null>(null);
  const [panelTopPx, setPanelTopPx] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();
  const menuOpen = menuMounted;
  const navTabs = tabs.filter((tab) => tab.type !== "locale");

  const MENU_ANIM_MS = 240;
  const iconButtonClass =
    "ui-pop-tap relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-50";

  function measurePanelTop(host: HTMLElement | null): number {
    if (!host) return 0;
    const header = host.querySelector<HTMLElement>("[data-guest-header]");
    if (!header) return 0;
    const hostRect = host.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    return Math.max(0, Math.round(headerRect.bottom - hostRect.top));
  }

  function openMenu() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    const host =
      triggerRef.current?.closest<HTMLElement>("[data-phone-screen]") ??
      triggerRef.current?.closest<HTMLElement>("[data-guest-page-shell]") ??
      overlayHost;
    if (host) {
      setOverlayHost(host);
      setPanelTopPx(measurePanelTop(host));
    }
    setMenuMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMenuEntered(true));
    });
  }

  function closeMenu() {
    setMenuEntered(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setMenuMounted(false);
      closeTimerRef.current = null;
    }, MENU_ANIM_MS);
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!containOverlays) {
      setOverlayHost(null);
      return;
    }
    const host =
      triggerRef.current?.closest<HTMLElement>("[data-phone-screen]") ??
      triggerRef.current?.closest<HTMLElement>("[data-guest-page-shell]") ??
      null;
    setOverlayHost(host);
  }, [containOverlays]);

  useEffect(() => {
    if (!menuOpen && !phoneOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        setPhoneOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, phoneOpen]);

  if (navTabs.length === 0) return null;

  function handleTab(tab: GuestShellTab) {
    if (tab.type === "locale") return;
    if (previewMode) {
      if (tab.type === "phone") {
        setPhoneValue(tab.phone?.trim() || null);
        closeMenu();
        setPhoneOpen(true);
      }
      return;
    }
    if (tab.type === "phone") {
      const phone = tab.phone?.trim() || null;
      setPhoneValue(phone);
      closeMenu();
      setPhoneOpen(true);
      return;
    }
    const slug = tab.pageSlug?.trim();
    if (!slug) return;
    closeMenu();
    if (slug === currentSlug) return;
    const href = buildGuestPagePath(slug, {
      preview,
      clientApp,
      lang: locale !== "ja" ? locale : null,
    });
    window.location.assign(href);
  }

  const telHref = phoneValue ? toTelHref(phoneValue) : null;
  const overlayPositionClass = containOverlays ? "absolute" : "fixed";

  const menuCopy =
    locale === "ko"
      ? { menu: "메뉴", open: "메뉴 열기", close: "닫기" }
      : locale === "zh"
        ? { menu: "菜单", open: "打开菜单", close: "关闭" }
        : locale === "en"
          ? { menu: "Menu", open: "Open menu", close: "Close" }
          : { menu: "メニュー", open: "メニューを開く", close: "閉じる" };

  const phoneSheetCopy =
    locale === "ko"
      ? {
          title: "프론트",
          canCall: "프론트로 전화할 수 있습니다",
          call: "전화하기",
          missing: "전화번호가 아직 설정되지 않았습니다.",
          close: "닫기",
        }
      : locale === "zh"
        ? {
            title: "前台",
            canCall: "可拨打前台电话",
            call: "拨打电话",
            missing: "尚未设置电话号码。",
            close: "关闭",
          }
        : locale === "en"
          ? {
              title: "Front desk",
              canCall: "You can call the front desk",
              call: "Call",
              missing: "A phone number has not been set yet.",
              close: "Close",
            }
          : {
              title: "フロント",
              canCall: "フロントへ電話できます",
              call: "電話する",
              missing: "電話番号がまだ設定されていません。施設の設定からフロント番号を登録してください。",
              close: "閉じる",
            };

  function renderOverlay(node: ReactNode) {
    if (containOverlays && overlayHost) {
      return createPortal(node, overlayHost);
    }
    return node;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (menuMounted ? closeMenu() : openMenu())}
        className={iconButtonClass}
        aria-label={menuEntered ? menuCopy.close : menuCopy.open}
        aria-expanded={menuEntered}
        aria-haspopup="dialog"
      >
        <span className="relative block h-5 w-5" aria-hidden>
          <svg
            className={
              "absolute inset-0 h-5 w-5 transition-[opacity,transform] duration-[240ms] ease-out " +
              (menuEntered
                ? "rotate-90 scale-75 opacity-0"
                : "rotate-0 scale-100 opacity-100")
            }
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <svg
            className={
              "absolute inset-0 h-5 w-5 transition-[opacity,transform] duration-[240ms] ease-out " +
              (menuEntered
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-75 opacity-0")
            }
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </span>
      </button>

      {menuMounted
        ? renderOverlay(
            <div className={`${overlayPositionClass} inset-0 z-[80]`} role="presentation">
              <button
                type="button"
                className={
                  "absolute inset-0 cursor-default bg-slate-900/35 transition-opacity duration-[240ms] ease-out " +
                  (menuEntered ? "opacity-100" : "opacity-0")
                }
                style={panelTopPx > 0 ? { top: panelTopPx } : undefined}
                aria-label={menuCopy.close}
                onClick={closeMenu}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={
                  "absolute left-0 right-0 z-[1] border-b border-slate-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.18)] " +
                  "origin-top transition-[opacity,transform] duration-[240ms] ease-out will-change-transform " +
                  (menuEntered
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-2 opacity-0")
                }
                style={{ top: panelTopPx }}
              >
                <h2 id={titleId} className="sr-only">
                  {menuCopy.menu}
                </h2>
                <nav className="px-2 py-2" aria-label="館内ナビ">
                  <ul className="space-y-0.5">
                    {navTabs.map((tab) => {
                      const active = isTabActive(tab, currentSlug);
                      const disabled =
                        ((tab.type === "home" || tab.type === "page") && !tab.pageSlug?.trim()) ||
                        (tab.type === "phone" && !tab.phone?.trim());
                      const softDisabled = !previewMode && disabled && tab.type !== "phone";
                      return (
                        <li key={tab.id}>
                          <button
                            type="button"
                            onClick={() => handleTab(tab)}
                            disabled={softDisabled}
                            className={
                              "ui-pop-tap flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition " +
                              (active
                                ? "bg-emerald-600 !text-white"
                                : softDisabled
                                  ? "cursor-not-allowed text-slate-300"
                                  : "text-slate-800 hover:bg-emerald-50")
                            }
                            style={active ? { color: "#ffffff" } : undefined}
                            aria-current={active ? "page" : undefined}
                          >
                            <MenuIcon type={tab.type} />
                            <span className="min-w-0 flex-1 truncate">{getGuestShellTabLabel(tab, locale)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </div>,
          )
        : null}

      {phoneOpen
        ? renderOverlay(
            <div
              className={`${overlayPositionClass} inset-0 z-[80] flex items-end justify-center bg-slate-900/40 p-3`}
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
                className="relative z-[1] w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ui-pop-in"
              >
                <h2 id={`${titleId}-phone`} className="text-base font-semibold text-slate-900">
                  {phoneSheetCopy.title}
                </h2>
                {phoneValue && telHref ? (
                  <>
                    <p className="mt-2 text-sm text-slate-600">{phoneSheetCopy.canCall}</p>
                    <p className="mt-1 text-lg font-semibold tracking-wide text-slate-900">{phoneValue}</p>
                    <a
                      href={telHref}
                      className="ui-pop-tap mt-4 flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold !text-white"
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
