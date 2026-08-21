import {
  createDefaultGuestShellConfig,
  withGuestShellNavStyle,
  type GuestShellConfig,
  type GuestShellNavStyle,
} from "@/lib/guest-shell";

/**
 * Per-template guest chrome for marketplace preview + page create.
 * Target mix ≈ tabs 60% / hamburger 25% / off 15%.
 */
export const TEMPLATE_GUEST_NAV_BY_SLUG: Record<string, GuestShellNavStyle> = {
  // ── hotel (20): tabs 12 · hamburger 5 · off 3 ───────────────────────────
  "case-business-hotel": "tabs",
  "hotel-guest-guide": "tabs",
  "hotel-stay-flow": "tabs",
  "hotel-plan-pricing": "hamburger",
  "hotel-long-stay": "tabs",
  "case-onsen-ryokan": "tabs",
  "hotel-ryokan-omotenashi": "tabs",
  "hotel-ryokan-onsen-etiquette": "hamburger",
  "case-resort-stay": "tabs",
  "hotel-live-crowd": "tabs",
  "hotel-restaurant-menu": "hamburger",
  "hotel-resort-gallery": "off",
  "hotel-spa-wellness": "hamburger",
  "hotel-family-stay": "tabs",
  "hotel-core-hub": "tabs",
  "hotel-area-sightseeing": "off",
  "hotel-airbnb-self-checkin": "tabs",
  "hotel-airbnb-house-guide": "off",
  "hotel-inbound-multilingual": "hamburger",
  "hotel-inbound-arrival-support": "tabs",

  // ── btoc (24): tabs 14 · hamburger 6 · off 4 ─────────────────────────────
  "travel-itinerary": "tabs",
  "travel-weekend": "tabs",
  "travel-group": "tabs",
  "oshi-live-set": "tabs",
  "oshi-fan-meet": "tabs",
  "oshi-link-hub": "hamburger",
  "personal-date-plan": "hamburger",
  "personal-link-collection": "off",
  "personal-event-guide": "tabs",
  "food-kitchen-car-today": "tabs",
  "food-truck-weekly": "tabs",
  "food-festival-stall": "tabs",
  "food-preorder-pickup": "hamburger",
  "food-cafe-popup": "off",
  "lightbiz-salon": "tabs",
  "lightbiz-fitness-studio": "tabs",
  "lightbiz-classroom": "tabs",
  "lightbiz-popup-shop": "hamburger",
  "lightbiz-office-visit": "hamburger",
  "lightbiz-freelance-portfolio": "off",
  "travel-camp-outdoor": "tabs",
  "personal-wedding-party": "hamburger",
  "personal-housewarming": "off",
  "oshi-offline-meetup": "tabs",
};

const NAV_STYLE_LABELS: Record<GuestShellNavStyle, string> = {
  tabs: "下タブナビ",
  hamburger: "ハンバーガー",
  off: "メニューなし",
};

const NAV_STYLE_HINTS: Record<GuestShellNavStyle, string> = {
  tabs: "画面下に常時表示。よく使う導線向け",
  hamburger: "右上から開く。コンテンツを広く見せたいとき向け",
  off: "ナビなし。1ページ完結の案内向け",
};

export function getTemplateGuestNavStyle(slug: string | null | undefined): GuestShellNavStyle {
  if (!slug) return "tabs";
  return TEMPLATE_GUEST_NAV_BY_SLUG[slug] ?? "tabs";
}

/** Preview / apply config. Always includes default link slots (home / phone / FAQ). */
export function resolveTemplateGuestShellConfig(
  slug: string | null | undefined,
): GuestShellConfig {
  const navStyle = getTemplateGuestNavStyle(slug);
  return withGuestShellNavStyle(createDefaultGuestShellConfig(), navStyle);
}

export function getTemplateGuestNavLabel(navStyle: GuestShellNavStyle): string {
  return NAV_STYLE_LABELS[navStyle];
}

export function getTemplateGuestNavHint(navStyle: GuestShellNavStyle): string {
  return NAV_STYLE_HINTS[navStyle];
}
