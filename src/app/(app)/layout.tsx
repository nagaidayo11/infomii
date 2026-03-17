"use client";

import { usePathname } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { AppLayout } from "@/components/app";

/**
 * Layout for authenticated app routes.
 * - /editor/* : AuthGate only. Dedicated EditorLayout only (no DashboardLayout).
 *   EditorLayout = EditorTopBar + CardLibrary | Canvas | CardSettings.
 * - Other (dashboard, templates, etc.): AuthGate + AppLayout (sidebar + topbar + main).
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith("/editor");

  return (
    <AuthGate>
      {isEditor ? (
        <>{children}</>
      ) : (
        <AppLayout>{children}</AppLayout>
      )}
    </AuthGate>
  );
}
