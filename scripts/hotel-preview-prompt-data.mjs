/**
 * Hotel marketplace template preview prompts — slug paths match marketplaceTemplatePreviewPath().
 * Run: npm run templates:previews:hotel:manifest && npm run templates:previews:hotel:openai
 */

const BASE = [
  "Hotel guest-guide template listing card hero image.",
  "Photorealistic commercial quality, 5:3 horizontal composition (~1920×1152).",
  "Experience-forward scene — not a flat centered facade-only shot.",
  "No readable text, logos, watermarks, QR codes, or UI overlays.",
].join(" ");

const NEGATIVE = "Avoid: blurry, low quality, readable signage, brand logos, watermark.";

/** @type {Record<string, string>} */
const CATEGORY_CORE = {
  business:
    "Compact city business hotel near a station. Clean lobby threshold, taxi drop-off, or walkway to entrance. Functional, practical, urban — no palm trees or beach resort mood.",
  resort:
    "Resort hotel integrated with nature — sea, forest, or lush garden. Arrival deck, open lobby transition, or scenic walkway. Non-everyday vacation atmosphere — not a dense office district.",
  ryokan:
    "Traditional Japanese ryokan inn. Wooden lattice, tile roof, stone path, paper lanterns, garden gate. Calm, refined wa aesthetic — not modern glass tower, not tropical resort.",
  airbnb:
    "Whole-house vacation rental or small guesthouse in a residential neighborhood. Porch, keybox area, or cozy entrance — homelike, not a large hotel tower.",
  guide:
    "Hotel as a destination within a walkable town or sightseeing area. Street approach with the property as focal point — urban exploration context.",
  inbound:
    "International-friendly hotel arrival: bright entrance, clear circulation, welcoming lobby edge. Universal, approachable — not dark alley mood.",
};

/** Template-specific scene overrides (merged with category core). */
/** @type {Record<string, string>} */
const SLUG_SCENE = {
  "case-business-hotel":
    "Business hotel front desk area glimpse through lobby glass, compact urban hotel entrance at night with warm lobby light. Wi-Fi and checkout workflow vibe for business travelers.",
  "case-onsen-ryokan":
    "Ryokan with visible onsen bathing culture: wooden bathhouse entrance, steam, stone rotenburo edge, yukata on hanger nearby. Traditional hot spring inn — absolutely NOT a hair salon or beauty parlor.",
  "case-resort-stay":
    "Resort stay operations: pool deck or marina shuttle pickup point, activity schedule board area without readable text, families heading to experiences. Same-day updates mood.",
  "hotel-guest-guide":
    "Single-page guest guide mood: business hotel room corridor to lobby, practical stay information atmosphere.",
  "hotel-core-hub":
    "Hotel interior hub navigation: bright atrium or lobby junction with multiple circulation paths, circle-icon wayfinding mood without readable signs.",
  "hotel-live-crowd":
    "Hotel restaurant or bathhouse busy-but-manageable atmosphere — live crowd status board area, breakfast buffet zone edge, operational realtime mood.",
  "hotel-restaurant-menu":
    "Hotel restaurant dining room atmosphere — table settings, open kitchen glimpse, menu presentation mood without readable menus.",
  "hotel-stay-flow":
    "Check-in to check-out journey: hotel reception counter, key card handoff moment, step-by-step stay flow.",
  "hotel-resort-gallery":
    "Resort photo gallery mood: infinity pool overlook, lounge sunset, spa terrace — experiential collage feeling in one frame.",
  "hotel-ryokan-omotenashi":
    "Ryokan omotenashi: tatami corridor, kaiseki dining room exterior, lantern-lit entrance, gracious Japanese hospitality.",
  "hotel-airbnb-self-checkin":
    "Vacation rental self check-in: key lockbox on residential door, smartphone in hand silhouette, tidy entryway.",
  "hotel-area-sightseeing":
    "Hotel neighborhood exploration: charming local street leading toward hotel, map kiosk area, sightseeing walk mood.",
  "hotel-inbound-multilingual":
    "International hotel welcome desk, diverse travelers with luggage, bright multilingual-friendly lobby — no readable language signs.",
  "hotel-plan-pricing":
    "Business hotel comparison mood: clean room types visible through corridor, value-focused urban stay — not luxury resort.",
  "hotel-long-stay":
    "Extended stay hotel: coin laundry corner, kitchenette area, residential-style hotel room wing — long-term living convenience.",
  "hotel-spa-wellness":
    "Hotel spa and wellness: onsen-style bath, sauna door, treatment room corridor — relaxation and bathing, NOT hair salon.",
  "hotel-family-stay":
    "Family-friendly resort or hotel: kids pool shallow end, stroller near lobby, family wing corridor — safe and welcoming.",
  "hotel-ryokan-onsen-etiquette":
    "CRITICAL: Japanese ryokan public hot spring bathhouse (onsen) etiquette scene. Wooden changing area transition, steam rising from hinoki bath, stone tiles, bamboo ladle, slippers — traditional bathing culture. MUST NOT show hair salon, beauty parlor, styling chairs, salon mirrors, or hairdresser.",
  "hotel-airbnb-house-guide":
    "Whole-house rental guide: living room with house manual on table, Wi-Fi router shelf, residential comfort.",
  "hotel-inbound-arrival-support":
    "Airport-hotel arrival support: limousine bus stop at hotel, front desk with luggage carts, first-time visitor welcome.",
};

/** @type {Array<{slug: string, name: string, category: string}>} */
export const HOTEL_PREVIEW_TEMPLATES = [
  { slug: "case-business-hotel", name: "【事例】ビジネスホテル案内", category: "business" },
  { slug: "case-onsen-ryokan", name: "【事例】温泉旅館・温浴案内", category: "ryokan" },
  { slug: "case-resort-stay", name: "【事例】リゾート滞在案内", category: "resort" },
  { slug: "hotel-guest-guide", name: "1枚完結・ゲスト案内", category: "business" },
  { slug: "hotel-core-hub", name: "館内ハブ・サークル導線", category: "guide" },
  { slug: "hotel-live-crowd", name: "ライブ混雑・いま状況ボード", category: "resort" },
  { slug: "hotel-restaurant-menu", name: "レストラン・メニュー特化", category: "resort" },
  { slug: "hotel-stay-flow", name: "滞在の流れ・ステップ", category: "business" },
  { slug: "hotel-resort-gallery", name: "リゾート・体験ギャラリー", category: "resort" },
  { slug: "hotel-ryokan-omotenashi", name: "旅館・おもてなし案内", category: "ryokan" },
  { slug: "hotel-airbnb-self-checkin", name: "民泊・セルフチェックイン", category: "airbnb" },
  { slug: "hotel-area-sightseeing", name: "周辺観光・回遊ガイド", category: "guide" },
  { slug: "hotel-inbound-multilingual", name: "インバウンド・多言語案内", category: "inbound" },
  { slug: "hotel-plan-pricing", name: "料金・プラン比較", category: "business" },
  { slug: "hotel-long-stay", name: "長期滞在・生活案内", category: "business" },
  { slug: "hotel-spa-wellness", name: "スパ・ウェルネス案内", category: "resort" },
  { slug: "hotel-family-stay", name: "ファミリー滞在", category: "resort" },
  { slug: "hotel-ryokan-onsen-etiquette", name: "旅館・温泉マナー", category: "ryokan" },
  { slug: "hotel-airbnb-house-guide", name: "民泊・ハウスガイド", category: "airbnb" },
  { slug: "hotel-inbound-arrival-support", name: "インバウンド・到着サポート", category: "inbound" },
];

function buildPrompt(template) {
  const categoryCore = CATEGORY_CORE[template.category] ?? CATEGORY_CORE.business;
  const slugScene = SLUG_SCENE[template.slug] ?? categoryCore;
  return [
    BASE,
    `Category: ${template.category}.`,
    categoryCore,
    `Template focus (${template.name}): ${slugScene}`,
    NEGATIVE,
  ].join(" ");
}

/** @type {import('./btoc-preview-prompt-data.mjs').BtocPreviewEntry[]} */
export const HOTEL_PREVIEW_ENTRIES = HOTEL_PREVIEW_TEMPLATES.map((t, i) => ({
  slug: t.slug,
  name: t.name,
  category: t.category,
  categoryIndex: i,
  previewPath: `/templates/previews/${t.category}/${t.slug}.jpg`,
  hint: SLUG_SCENE[t.slug] ?? null,
  prompt: buildPrompt(t),
}));
