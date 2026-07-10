"use client";

import { useCallback, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { RouteProgressProvider } from "./RouteProgressContext";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  const pathname = usePathname();

  return (
    <div className="app-ambient-bg flex h-[100dvh] w-full overflow-hidden bg-[#f6f8fa]">
      <RouteProgressProvider>
        <MobileNavDrawer open={mobileNavOpen} onClose={closeMobileNav} />
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f6f8fa]">
          <Topbar actions={topbarActions} onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main
            className="app-page-atmosphere relative z-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 text-[0.9375rem] leading-relaxed sm:px-6 sm:py-7 lg:px-8"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div key={pathname} className="app-content-enter">
              {children}
            </div>
          </main>
        </div>
      </RouteProgressProvider>
    </div>
  );
}
