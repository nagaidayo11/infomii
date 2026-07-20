import type { Metadata } from "next";
import { AuthGate } from "@/components/auth-gate";
import { EditorWebFonts } from "@/components/seo/EditorWebFonts";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Editor layout: protect /editor/* with auth. No dashboard sidebar.
 * Extra typefaces load here (and on guest pages) — not on marketing LP/blog.
 */
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EditorWebFonts />
      <AuthGate>{children}</AuthGate>
    </>
  );
}
