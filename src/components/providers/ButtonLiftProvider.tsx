"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export type ButtonLiftValue = { liftEnabled: boolean };

export const ButtonLiftContext = createContext<ButtonLiftValue>({ liftEnabled: true });

export function useButtonLift() {
  return useContext(ButtonLiftContext);
}

/**
 * LP（/lp/*）と編集（/editor*）以外で、ボタンに LP 同様のホバー浮きを有効にする。
 * ネイティブの button は `.app-button-native` と併用（globals.css）。
 */
export function ButtonLiftProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const liftEnabled = useMemo(() => {
    if (!pathname) return true;
    if (pathname.startsWith("/lp/")) return false;
    if (pathname.startsWith("/editor")) return false;
    return true;
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.appButtonlift = liftEnabled ? "true" : "false";
    return () => {
      delete document.documentElement.dataset.appButtonlift;
    };
  }, [liftEnabled]);

  return <ButtonLiftContext.Provider value={{ liftEnabled }}>{children}</ButtonLiftContext.Provider>;
}
