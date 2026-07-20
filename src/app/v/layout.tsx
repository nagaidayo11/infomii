import { EditorWebFonts } from "@/components/seo/EditorWebFonts";

/** Guest published pages may use editor-selected typefaces. */
export default function GuestVLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EditorWebFonts />
      {children}
    </>
  );
}
