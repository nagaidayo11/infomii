import { BRAND_ACCENT, BRAND_ACCENT_STRONG } from "@/lib/brand-accent";

/** LP /lp/business accent — matches --color-ds-accent in globals.css */
export const LP_HOTEL_ACCENT = BRAND_ACCENT;
export const LP_HOTEL_ACCENT_STRONG = BRAND_ACCENT_STRONG;

/** Primary CTA — same treatment as LpSaasHeader */
export const LP_HOTEL_CTA_CLASS =
  "lp-cta-attention !border-ds-accent/30 !bg-ds-accent !text-white hover:!bg-ds-accent-strong hover:!shadow-[0_2px_8px_rgba(5,150,105,0.22)]";

export const LP_HOTEL_CTA_LG_CLASS = `${LP_HOTEL_CTA_CLASS} min-h-[52px] px-8 !text-base`;

/** Hero / dark-surface accent type — same green family as the Infomii “ii”. */
export const LP_HOTEL_GRADIENT_TEXT_CLASS =
  "bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-400 bg-clip-text text-transparent";

export const LP_HOTEL_GLOW_RGBA = "rgba(5, 150, 105, 0.28)";
export const LP_HOTEL_RING_RGBA = "rgba(5, 150, 105, 0.12)";
