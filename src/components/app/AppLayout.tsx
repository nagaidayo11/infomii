"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppLayoutProps = {
  children: ReactNode;
  /** Override topbar title */
  title?: string;
  /** Override topbar subtitle */
  subtitle?: string;
  /** Actions (buttons) in the topbar */
  topbarActions?: ReactNode;
};

/**
 * Shared app layout for authenticated pages.
 * Structure: Sidebar (left) + Topbar + Main content.
 * Editor routes (/editor/*) use full-bleed main (no padding) for 3-column editor.
 */
export function AppLayout({
  children,
  title,
  subtitle,
  topbarActions,
}: AppLayoutProps) {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith("/editor");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ds-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={title} subtitle={subtitle} actions={topbarActions} />
        <main
          className={
            "flex-1 overflow-y-auto " +
            (isEditor ? "flex flex-col p-0 overflow-hidden" : "p-6")
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
