import type { Metadata } from "next";
import { EditorWebFonts } from "@/components/seo/EditorWebFonts";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/**
 * App-group editor segment. Extra typefaces for canvas preview.
 */
export default function EditorGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EditorWebFonts />
      {children}
    </>
  );
}
