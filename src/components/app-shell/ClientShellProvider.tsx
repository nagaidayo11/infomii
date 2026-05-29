"use client";

import { createContext, useEffect, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  detectClientShell,
  persistClientShellCookie,
  readClientShellCookie,
  type ClientShell,
} from "@/lib/client-shell";

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
      cookie: readClientShellCookie(),
    });
  }, [searchParams]);

  useEffect(() => {
    persistClientShellCookie(client);
  }, [client]);

  const value = useMemo(
    () => ({
      client,
      isAppShell: client === "app",
    }),
    [client],
  );

  return <ClientShellContext.Provider value={value}>{children}</ClientShellContext.Provider>;
}
