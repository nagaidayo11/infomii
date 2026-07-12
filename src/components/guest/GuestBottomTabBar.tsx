"use client";

import { useEffect, useId, useState } from "react";
import {
  buildGuestPagePath,
  getGuestShellTabLabel,
  toTelHref,
  type GuestShellTab,
} from "@/lib/guest-shell";
import type { SupportedLocale } from "@/lib/localized-content";

type GuestBottomTabBarProps = {
  tabs: GuestShellTab[];
  currentSlug: string;
  /** Active locale for language sheet */
  locale: SupportedLocale;
  onLocaleChange: (locale: SupportedLocale) => void;
  preview?: boolean;
  clientApp?: boolean;
  /** When language sheet opens from tab */
  localeHint?: string | null;
  /** Editor preview: tabs look active but do not navigate */
  previewMode?: boolean;
};

const LOCALES: Array<{ code: SupportedLocale; label: string }> = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" },
];

function TabIcon({ type }: { type: GuestShellTab["type"] }) {
  const className = "h-5 w-5";
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
 * Facility-wide bottom tab bar for guest pages (Core Guide–style chrome).
 */
export function GuestBottomTabBar({
  tabs,
  currentSlug,
  locale,
  onLocaleChange,
  preview = false,
  clientApp = false,
  localeHint = null,
  previewMode = false,
}: GuestBottomTabBarProps) {
  const [localeOpen, setLocaleOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!localeOpen && !phoneOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLocaleOpen(false);
        setPhoneOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [localeOpen, phoneOpen]);

  if (tabs.length === 0) return null;

  const activeTabClass = "bg-emerald-50 text-emerald-900 font-bold";
  const inactiveTabClass = "text-slate-500 font-medium active:bg-slate-50";
  const disabledTabClass = "cursor-not-allowed text-slate-300";

  function handleTab(tab: GuestShellTab) {
    if (previewMode) {
      if (tab.type === "locale") setLocaleOpen(true);
      if (tab.type === "phone") {
        setPhoneValue(tab.phone?.trim() || null);
        setPhoneOpen(true);
      }
      return;
    }
    if (tab.type === "locale") {
      setLocaleOpen(true);
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

  const localeSheetCopy =
    locale === "ko"
      ? { title: "언어", hint: "표시 언어를 선택하세요", close: "닫기" }
      : locale === "zh"
        ? { title: "语言", hint: "请选择显示语言", close: "关闭" }
        : locale === "en"
          ? { title: "Language", hint: "Choose a display language", close: "Close" }
          : { title: "言語", hint: "表示言語を選んでください", close: "閉じる" };

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
        className="guest-bottom-tabs shrink-0 border-t border-emerald-100 bg-white/95 backdrop-blur-sm"
        style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
        aria-label="館内ナビ"
      >
        <div className="mx-auto flex max-w-[420px] items-stretch justify-around gap-0.5 px-1 pt-1">
          {tabs.map((tab) => {
            const active = isTabActive(tab, currentSlug);
            const disabled =
              ((tab.type === "home" || tab.type === "page") && !tab.pageSlug?.trim()) ||
              (tab.type === "phone" && !tab.phone?.trim());
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTab(tab)}
                disabled={!previewMode && disabled && tab.type !== "phone" && tab.type !== "locale"}
                className={
                  "ui-pop-tap flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] transition-colors " +
                  (active
                    ? activeTabClass
                    : disabled && !previewMode && tab.type !== "phone" && tab.type !== "locale"
                      ? disabledTabClass
                      : inactiveTabClass)
                }
                aria-current={active ? "page" : undefined}
              >
                <TabIcon type={tab.type} />
                <span className="max-w-full truncate">{getGuestShellTabLabel(tab, locale)}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {localeOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 p-3 sm:items-center" role="presentation">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label={localeSheetCopy.close}
            onClick={() => setLocaleOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-[1] w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
          >
            <h2 id={titleId} className="text-base font-semibold text-slate-900">
              {localeSheetCopy.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">{localeSheetCopy.hint}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {LOCALES.map((item) => {
                const active = locale === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      onLocaleChange(item.code);
                      if (localeHint?.trim()) setHintVisible(true);
                      setLocaleOpen(false);
                    }}
                    className={
                      "ui-pop-tap rounded-xl border px-3 py-3 text-sm font-medium transition " +
                      (active
                        ? "border-emerald-600 bg-emerald-600 !text-white"
                        : "border-emerald-100 bg-white text-emerald-900 hover:bg-emerald-50")
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
              onClick={() => setLocaleOpen(false)}
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {localeSheetCopy.close}
            </button>
          </div>
        </div>
      ) : null}

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
            className="relative z-[1] w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
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
        </div>
      ) : null}

      {hintVisible && localeHint ? (
        <div
          onAnimationEnd={() => setHintVisible(false)}
          className="pointer-events-none fixed bottom-24 left-1/2 z-[90] w-[min(92vw,360px)] -translate-x-1/2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-900 shadow-sm toast-slide-in-out"
          style={{ animationDuration: "2s" }}
        >
          {localeHint}
        </div>
      ) : null}
    </>
  );
}
