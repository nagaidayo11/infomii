"use client";

import { createContext, useEffect, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  detectClientShell,
  isNativeInfomiiAppClient,
  persistClientShellCookie,
  type ClientShell,
} from "@/lib/client-shell";
import { AppShellEffects } from "./AppShellEffects";
import { AppToastProvider } from "./AppToastProvider";

type ClientShellContextValue = {
  client: ClientShell;
  isAppShell: boolean;
};

export const ClientShellContext = createContext<ClientShellContextValue>({
  client: "web",
  isAppShell: false,
});

export function ClientShellProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();

  const client = useMemo(() => {
    const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";
    return detectClientShell({
      search,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    });
  }, [searchParams]);

  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : undefined;
    persistClientShellCookie(client, { nativeApp: isNativeInfomiiAppClient(ua) });
  }, [client]);

  const value = useMemo(
    () => ({
      client,
      isAppShell: client === "app",
    }),
    [client],
  );

  const inner = (
    <>
      <AppShellEffects />
      {children}
    </>
  );

  return (
    <ClientShellContext.Provider value={value}>
      {client === "app" ? <AppToastProvider>{inner}</AppToastProvider> : inner}
    </ClientShellContext.Provider>
  );
}
