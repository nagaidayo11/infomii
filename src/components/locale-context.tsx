"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { normalizeLocale } from "@/lib/localized-content";

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

/**
 * 訪問者のブラウザ言語を検出し、ロケールを提供する。
 * 公開ページでカードを表示する際にラップして使用する。
 */
export function VisitorLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>("ja");

  useEffect(() => {
    const raw = typeof navigator !== "undefined" ? navigator.language : "";
    const normalized = normalizeLocale(raw);
    setLocale(normalized ?? "ja");
  }, []);

  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}
