/** Box shadow presets for page link tiles / circle icons (`none` | `sm` | `md` | `lg`). */
export function pageLinkShadowClass(strength: string): string {
  switch (strength) {
    case "none":
      return "shadow-none";
    case "sm":
      return "shadow-[0_2px_8px_rgba(2,6,23,0.1)]";
    case "lg":
      return "shadow-[0_10px_28px_rgba(2,6,23,0.24)]";
    case "md":
    default:
      return "shadow-[0_4px_12px_rgba(2,6,23,0.16)]";
  }
}

/** Icon + wrapper sizes per variant (sm / md / lg). */
export const PAGE_LINK_ICON_SIZES = {
  circle: {
    sm: { wrap: "h-10 w-10", icon: "h-4 w-4" },
    md: { wrap: "h-14 w-14", icon: "h-5.5 w-5.5" },
    lg: { wrap: "h-[4.5rem] w-[4.5rem]", icon: "h-7 w-7" },
  },
  tile: {
    sm: { wrap: "h-7 w-7", icon: "h-4 w-4" },
    md: { wrap: "h-10 w-10", icon: "h-5.5 w-5.5" },
    lg: { wrap: "h-12 w-12", icon: "h-7 w-7" },
  },
} as const;

export type PageLinkIconSize = "sm" | "md" | "lg";
export type PageLinkStyleVariant = "circle" | "tile";
export type PageLinkShadowStrength = "none" | "sm" | "md" | "lg";

export function readPageLinkIconSize(raw: unknown): PageLinkIconSize {
  return raw === "sm" || raw === "lg" ? raw : "md";
}

export function readPageLinkStyleVariant(raw: unknown): PageLinkStyleVariant {
  return raw === "circle" ? "circle" : "tile";
}

export function readPageLinkShadowStrength(raw: unknown, fallback: PageLinkShadowStrength = "md"): PageLinkShadowStrength {
  return raw === "none" || raw === "sm" || raw === "md" || raw === "lg" ? raw : fallback;
}
