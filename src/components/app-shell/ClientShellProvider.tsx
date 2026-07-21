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
import { AppDialogProvider } from "./AppDialogProvider";

type ClientShellContextValue = {
  client: ClientShell;
  isAppShell: boolean;
  /**
   * App deformed / native-feel UI (Phase 0+).
   * Currently equals isAppShell; keep as a separate flag so Phase 1–2 can gate
   * guest/editor redesigns without forking every isAppShell check.
   */
  isNativeUi: boolean;
};

export const ClientShellContext = createContext<ClientShellContextValue>({
  client: "web",
  isAppShell: false,
  isNativeUi: false,
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

  const value = useMemo(() => {
    const isAppShell = client === "app";
    return {
      client,
      isAppShell,
      isNativeUi: isAppShell,
    };
  }, [client]);

  const inner = (
    <>
      <AppShellEffects />
      {children}
    </>
  );

  return (
    <ClientShellContext.Provider value={value}>
      {client === "app" ? (
        <AppToastProvider>
          <AppDialogProvider>{inner}</AppDialogProvider>
        </AppToastProvider>
      ) : (
        inner
      )}
    </ClientShellContext.Provider>
  );
}
