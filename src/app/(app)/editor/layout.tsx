"use client";

/**
 * Editor segment layout. No DashboardLayout — editor pages render
 * the dedicated EditorLayout (EditorTopBar + CardLibrary | Canvas | CardSettings) only.
 */
export default function EditorGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

