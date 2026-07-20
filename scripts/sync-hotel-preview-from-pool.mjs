#!/usr/bin/env node
/**
 * Hybrid hotel preview sync:
 * - GENERATED_SLUGS: keep OpenAI outputs at slug path (do not overwrite)
 * - POOL_SOURCES: copy existing repo assets only where slug has no dedicated image
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

/** OpenAI 生成を維持する slug（sync では触らない） */
export const HOTEL_GENERATED_SLUGS = new Set([
  "case-business-hotel",
  "case-onsen-ryokan",
  "case-resort-stay",
  "hotel-ryokan-onsen-etiquette",
  "hotel-airbnb-house-guide",
  "hotel-inbound-arrival-support",
]);

/** slug → source under public/ — 生成対象以外でプールから初回配置する場合のみ */
const POOL_SOURCES = {
  "hotel-airbnb-house-guide": "/templates/previews/airbnb/hotel-airbnb-self-checkin.jpg",
  "hotel-inbound-arrival-support": "/templates/previews/inbound/hotel-inbound-multilingual.jpg",
};

const SLUG_CATEGORIES = {
  "case-business-hotel": "business",
  "case-onsen-ryokan": "ryokan",
  "case-resort-stay": "resort",
  "hotel-guest-guide": "business",
  "hotel-core-hub": "guide",
  "hotel-live-crowd": "resort",
  "hotel-restaurant-menu": "resort",
  "hotel-stay-flow": "business",
  "hotel-resort-gallery": "resort",
  "hotel-ryokan-omotenashi": "ryokan",
  "hotel-airbnb-self-checkin": "airbnb",
  "hotel-area-sightseeing": "guide",
  "hotel-inbound-multilingual": "inbound",
  "hotel-plan-pricing": "business",
  "hotel-long-stay": "business",
  "hotel-spa-wellness": "resort",
  "hotel-family-stay": "resort",
  "hotel-ryokan-onsen-etiquette": "ryokan",
  "hotel-airbnb-house-guide": "airbnb",
  "hotel-inbound-arrival-support": "inbound",
};

function main() {
  let copied = 0;
  let skipped = 0;

  for (const [slug, srcRel] of Object.entries(POOL_SOURCES)) {
    if (HOTEL_GENERATED_SLUGS.has(slug)) {
      console.log(`skip (generated): ${slug}`);
      skipped += 1;
      continue;
    }

    const category = SLUG_CATEGORIES[slug];
    if (!category) throw new Error(`Missing category for ${slug}`);

    const srcAbs = path.join(PUBLIC, srcRel.replace(/^\//, ""));
    const destRel = `/templates/previews/${category}/${slug}.jpg`;
    const destAbs = path.join(PUBLIC, destRel.replace(/^\//, ""));

    if (!fs.existsSync(srcAbs)) {
      console.error(`Missing source: ${srcRel}`);
      skipped += 1;
      continue;
    }

    if (fs.existsSync(destAbs)) {
      console.log(`skip (exists): ${destRel}`);
      skipped += 1;
      continue;
    }

    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    fs.copyFileSync(srcAbs, destAbs);
    console.log(`copied ${srcRel} → ${destRel}`);
    copied += 1;
  }

  console.log(`Done: copied=${copied}, skipped=${skipped}`);
  console.log(`Generated slugs (preserve): ${[...HOTEL_GENERATED_SLUGS].join(", ")}`);
}

main();
