#!/usr/bin/env node
/**
 * Writes public/templates/previews/manifest-btoc.json from scripts/btoc-preview-prompt-data.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { BTOC_PREVIEW_ENTRIES } from "./btoc-preview-prompt-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public/templates/previews/manifest-btoc.json");

const manifest = {
  version: 1,
  kind: "btoc",
  generated: new Date().toISOString(),
  note: "BtoC marketplace template previews. English prompts ~80–120 words. Run: npm run templates:previews:btoc:openai",
  entries: BTOC_PREVIEW_ENTRIES.map((e, i) => ({
    name: e.name,
    slug: e.slug,
    category: e.category,
    categoryIndex: i,
    previewPath: e.previewPath,
    hint: e.hint ?? null,
    styleNotes:
      "BtoC template card hero. Photorealistic 5:3 ~1920×1152. No readable text, logos, watermarks, UI, QR. No hotel-exterior-only shots.",
    generator: "npm run templates:previews:btoc:openai",
    prompt: e.prompt.trim(),
  })),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT} (${manifest.entries.length} entries)`);
