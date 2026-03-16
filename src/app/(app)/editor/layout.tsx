"use client";

import { AuthGate } from "@/components/auth-gate";

/**
 * Editor-only layout.
 * ダッシュボード用の AppLayout / Sidebar を使わず、
 * エディタ自身の EditorLayout（CardLibrary / Canvas / CardSettings）だけを表示する。
 */
export default function EditorGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGate>{children}</AuthGate>;
}

