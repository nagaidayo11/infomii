"use client";

import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
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

function detectClientShellFromSearch(search: string): ClientShell {
  return detectClientShell({ search });
}

export function ClientShellProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : "";

  /** SSR と初回 hydration で同じ値にする（UA / document はマウント後に反映） */
  const queryClient = useMemo(() => detectClientShellFromSearch(search), [search]);
  const [client, setClient] = useState<ClientShell>(queryClient);

  useEffect(() => {
    setClient(
      detectClientShell({
        search,
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      }),
    );
  }, [search]);

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
