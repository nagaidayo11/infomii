"use client";

import { AuthGate } from "@/components/auth-gate";

/**
 * Editor layout: protect /editor/* with auth. No dashboard sidebar.
 */
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGate>{children}</AuthGate>;
}
