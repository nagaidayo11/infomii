"use client";

import { useEffect, useId, useState } from "react";
import {
  buildGuestPagePath,
  getGuestShellTabLabel,
  resolveGuestShellTabIcon,
  toTelHref,
  type GuestShellTab,
  type GuestShellTabIcon,
} from "@/lib/guest-shell";
import type { SupportedLocale } from "@/lib/localized-content";

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

function TabIcon({ name }: { name: GuestShellTabIcon }) {
  const className = "h-5 w-5";
  if (name === "home") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
      </svg>
    );
  }
  if (name === "search") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
      </svg>
    );
  }
  if (name === "heart") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
        />
      </svg>
    );
  }
  if (name === "menu") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  }
  if (name === "phone") {
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
  if (name === "page") {
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
  if (name === "wifi") {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 13.5a5 5 0 017 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 10.5a9 9 0 0113 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 7.5a13 13 0 0119 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
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
  const titleId = useId();

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

  function handleTab(tab: GuestShellTab) {
    if (tab.type === "locale") return;
    if (previewMode) {
      if (tab.type === "phone") {
        setPhoneValue(tab.phone?.trim() || null);
        setPhoneOpen(true);
      }
      return;
    }
    if (tab.type === "phone") {
      const phone = tab.phone?.trim() || null;
      if (!phone) {
        setPhoneValue(null);
        setPhoneOpen(true);
        return;
      }
      setPhoneValue(phone);
      setPhoneOpen(true);
      return;
    }
    const slug = tab.pageSlug?.trim();
    if (!slug) return;
    if (slug === currentSlug) return;
    const href = buildGuestPagePath(slug, {
      preview,
      clientApp,
      lang: locale !== "ja" ? locale : null,
    });
    window.location.assign(href);
  }

  const telHref = phoneValue ? toTelHref(phoneValue) : null;

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

  return (
    <>
      <nav
        className="guest-bottom-tabs shrink-0 border-t border-slate-200/90 bg-white/95 backdrop-blur-sm"
        style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
        aria-label="館内ナビ"
      >
        <div className="mx-auto flex max-w-[420px] items-stretch justify-around gap-0.5 px-1 pt-1">
          {tabs.map((tab) => {
            if (tab.type === "locale") return null;
            const active = isTabActive(tab, currentSlug);
            const disabled =
              ((tab.type === "home" || tab.type === "page") && !tab.pageSlug?.trim()) ||
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
                <span className="max-w-full truncate">{getGuestShellTabLabel(tab, locale)}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {phoneOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 p-3 sm:items-center" role="presentation">
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
        </div>
      ) : null}
    </>
  );
}
