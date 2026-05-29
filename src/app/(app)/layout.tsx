"use client";

import { usePathname } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { AppLayout } from "@/components/app";
import { AppTabLayout } from "@/components/app-shell/AppTabLayout";
import { useClientShell } from "@/components/app-shell/useClientShell";

/**
 * Layout for authenticated app routes.
 * - /editor/* : handled in src/app/editor (no tab bar).
 * - client=app : bottom tab shell (Canva-style native).
 * - web : sidebar + topbar (AppLayout).
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAppShell } = useClientShell();
  const isEditor = pathname?.startsWith("/editor");

  if (isEditor) {
    return <AuthGate>{children}</AuthGate>;
  }

  return (
    <AuthGate>
      {isAppShell ? <AppTabLayout>{children}</AppTabLayout> : <AppLayout>{children}</AppLayout>}
    </AuthGate>
  );
}
