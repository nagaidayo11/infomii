"use client";

import { AuthGate } from "@/components/auth-gate";
import { AppLayout } from "@/components/app";

/**
 * Layout for all authenticated app routes.
 * (app) group: dashboard, editor, templates, analytics, settings.
 * Wraps with AuthGate and AppLayout (単一サイドバー + メイン).
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <AppLayout>{children}</AppLayout>
    </AuthGate>
  );
}
