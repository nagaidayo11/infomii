/**
 * Google Fonts URLs for marketing vs editor/guest surfaces.
 * Keep EDITOR_FONT_OPTIONS in sync when adding families.
 */

/** LP / blog / marketing — light enough for LCP. */
export const MARKETING_GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  ["family=M+PLUS+Rounded+1c:wght@400;700", "family=Noto+Sans+JP:wght@400;700"].join("&") +
  "&display=swap";

/** Editor canvas + published guest pages that may use optional typefaces. */
export const EDITOR_GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Inter:wght@400;500;600;700",
    "family=M+PLUS+Rounded+1c:wght@400;700",
    "family=Shippori+Mincho:wght@400;600",
    "family=Noto+Sans+JP:wght@400;700",
    "family=Noto+Serif+JP:wght@400;600",
  ].join("&") +
  "&display=swap";
