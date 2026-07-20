#!/usr/bin/env node
/**
 * Writes public/templates/previews/manifest-hotel.json from scripts/hotel-preview-prompt-data.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { HOTEL_PREVIEW_ENTRIES } from "./hotel-preview-prompt-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public/templates/previews/manifest-hotel.json");

const manifest = {
  version: 1,
  kind: "hotel",
  generated: new Date().toISOString(),
  note: "Hybrid: 6 slugs use OpenAI (HOTEL_GENERATED_SLUGS); others keep existing slug JPGs. sync = pool fallback only.",
  entries: HOTEL_PREVIEW_ENTRIES.map((e) => ({
    name: e.name,
    slug: e.slug,
    category: e.category,
    categoryIndex: e.categoryIndex,
    previewPath: e.previewPath,
    hint: e.hint ?? null,
    styleNotes:
      "Hotel template card hero. Photorealistic 5:3. No readable text, logos, watermarks. Match template theme — onsen NOT salon.",
    generator: "npm run templates:previews:hotel:openai",
    prompt: e.prompt.trim(),
  })),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT} (${manifest.entries.length} entries)`);
