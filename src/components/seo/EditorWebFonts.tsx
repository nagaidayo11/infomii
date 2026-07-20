import { EDITOR_GOOGLE_FONTS_HREF } from "@/lib/google-fonts";

/** Extra typefaces for editor / guest pages (not loaded on marketing routes). */
export function EditorWebFonts() {
  return <link rel="stylesheet" href={EDITOR_GOOGLE_FONTS_HREF} />;
}
