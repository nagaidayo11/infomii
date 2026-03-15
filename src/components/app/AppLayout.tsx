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
  /** Actions (buttons) in the topbar, before user menu */
  topbarActions?: ReactNode;
};

/**
 * Unified SaaS layout for the authenticated app (Next.js App Router).
 * Structure: Sidebar | Topbar + Main content.
 * Single sidebar only — icon + label, soft background, clean spacing.
 * Design: rounded-xl, soft shadows, Linear / Notion / Stripe inspired.
 */
export function AppLayout({
  children,
  title: _title,
  subtitle: _subtitle,
  topbarActions,
}: AppLayoutProps) {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith("/editor");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100/90">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar actions={topbarActions} />
        <main
          className={
            "flex-1 overflow-y-auto " +
            (isEditor
              ? "flex flex-col p-0 overflow-hidden"
              : "p-6")
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
