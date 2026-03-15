"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { normalizeLocale, type SupportedLocale } from "@/lib/localized-content";

type LocaleContextValue = string;

const LocaleContext = createContext<LocaleContextValue>("ja");

type LocaleProviderProps = {
  value: string;
  children: ReactNode;
};

/** 固定ロケール（例: エディタでは "ja"） */
export function LocaleProvider({ value, children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): string {
  return useContext(LocaleContext);
}

type VisitorLocaleProviderProps = {
  children: ReactNode;
  /** Initial locale from server (e.g. Accept-Language). Avoids flash before hydration. */
  initialLocale?: SupportedLocale;
};

/**
 * Detect visitor language and provide locale. Fallback to English.
 * Use on public/guest pages that render cards. Pass initialLocale from
 * getVisitorLocaleFromHeader(acceptLanguage) for SSR to avoid flash.
 */
export function VisitorLocaleProvider({ children, initialLocale = "en" }: VisitorLocaleProviderProps) {
  const [locale, setLocale] = useState<string>(initialLocale);

  useEffect(() => {
    const raw = typeof navigator !== "undefined" ? navigator.language : "";
    const normalized = normalizeLocale(raw);
    setLocale(normalized ?? "en");
  }, []);

  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}
