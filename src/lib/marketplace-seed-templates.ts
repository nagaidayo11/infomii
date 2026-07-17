import { BTOC_MARKETPLACE_SEED_TEMPLATES } from "@/lib/marketplace-seed-btoc";
import { HOTEL_MARKETPLACE_SEED_TEMPLATES } from "@/lib/marketplace-seed-hotel";
import type { MarketplaceSeedTemplate } from "@/lib/marketplace-seed-types";

export type { MarketplaceSeedTemplate } from "@/lib/marketplace-seed-types";

/** Marketplace seed templates: personal (BtoC) + hotel page archetypes. */
export const MARKETPLACE_SEED_TEMPLATES: MarketplaceSeedTemplate[] = [
  ...BTOC_MARKETPLACE_SEED_TEMPLATES,
  ...HOTEL_MARKETPLACE_SEED_TEMPLATES,
];
