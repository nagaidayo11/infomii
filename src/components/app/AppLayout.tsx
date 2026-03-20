"use client";

import type { ReactNode } from "react";
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
 * Dashboard layout (sidebar + topbar + main). Used only for non-editor routes.
 * Editor routes use no AppLayout; they use EditorLayout (Card Library | Canvas | Card Settings) only.
 */
export function AppLayout({
  children,
  title: _title,
  subtitle: _subtitle,
  topbarActions,
}: AppLayoutProps) {
  return (
    <div className="app-ambient-bg flex h-screen w-full overflow-hidden bg-slate-100/90">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar actions={topbarActions} />
        <main className="app-page-enter flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
