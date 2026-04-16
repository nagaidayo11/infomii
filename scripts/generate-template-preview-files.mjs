/**
 * One-time / maintenance: copy pool assets into public/templates/previews/<category>/<slug>.jpg
 * Keep hash + pool offsets in sync with src/lib/template-preview.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const TEMPLATE_IMAGE_POOL = [
  "/template-business-hero-01.jpg",
  "/template-business-detail-01.jpg",
  "/template-business-detail-02.jpg",
  "/template-business-detail-03.jpg",
  "/template-resort-hero-01.jpg",
  "/template-resort-detail-01.jpg",
  "/template-resort-detail-02.jpg",
  "/template-resort-detail-03.jpg",
  "/template-ryokan-hero-01.jpg",
  "/template-ryokan-detail-01.jpg",
  "/template-ryokan-detail-02.jpg",
  "/template-ryokan-detail-03.jpg",
  "/template-airbnb-hero-01.jpg",
  "/template-airbnb-detail-01.jpg",
  "/template-airbnb-detail-02.jpg",
  "/template-airbnb-detail-03.jpg",
  "/template-guide-hero-01.jpg",
  "/template-guide-detail-01.jpg",
  "/template-guide-detail-02.jpg",
  "/template-guide-detail-03.jpg",
  "/template-inbound-hero-01.jpg",
  "/template-inbound-detail-01.jpg",
  "/template-inbound-detail-02.jpg",
  "/template-inbound-detail-03.jpg",
  "/preset-menu-hero-dining.jpg",
  "/preset-menu-hero-beverage.jpg",
  "/preset-menu-hero-course.jpg",
  "/preset-menu-thumb-food.jpg",
  "/preset-menu-thumb-beverage.jpg",
  "/preset-menu-banner-category.jpg",
  "/preset-menu-thumb-salon.jpg",
  "/preset-menu-hero-salon.jpg",
];

const CATEGORY_POOL_OFFSET = {
  business: 0,
  resort: 5,
  ryokan: 10,
  airbnb: 3,
  guide: 7,
  inbound: 12,
};

function templatePreviewSlug(name) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i += 1) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function pickTemplatePoolAsset(category, indexInCategory) {
  const pool = TEMPLATE_IMAGE_POOL;
  const base = CATEGORY_POOL_OFFSET[category] ?? 0;
  return pool[(base + indexInCategory) % pool.length];
}

function parseSeedTemplates(routePath) {
  const text = fs.readFileSync(routePath, "utf8");
  const start = text.indexOf("const SEED_TEMPLATES");
  if (start < 0) throw new Error("SEED_TEMPLATES not found");
  const slice = text.slice(start);
  const end = slice.indexOf("];");
  const block = slice.slice(0, end + 2);
  const parts = block.split(/name:\s*"/);
  const entries = [];
  for (let i = 1; i < parts.length; i += 1) {
    const name = parts[i].split('"')[0];
    const rest = parts[i];
    const cm = rest.match(/category:\s*"([^"]+)"/);
    if (cm) entries.push({ name, category: cm[1] });
  }
  return entries;
}

function main() {
  const routePath = path.join(ROOT, "src/app/api/seed-templates/route.ts");
  const entries = parseSeedTemplates(routePath);
  const categoryIndexMap = new Map();
  const manifest = {
    version: 1,
    generated: new Date().toISOString(),
    note: "preview JPEG bytes copied from sourceAsset; paths match DB preview_image after seed sync",
    entries: [],
  };

  for (const t of entries) {
    const idx = categoryIndexMap.get(t.category) ?? 0;
    categoryIndexMap.set(t.category, idx + 1);
    const slug = templatePreviewSlug(t.name);
    const previewPath = `/templates/previews/${t.category}/${slug}.jpg`;
    const sourceAsset = pickTemplatePoolAsset(t.category, idx);
    const destAbs = path.join(ROOT, "public", previewPath);
    const srcAbs = path.join(ROOT, "public", sourceAsset);
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    fs.copyFileSync(srcAbs, destAbs);
    manifest.entries.push({
      name: t.name,
      category: t.category,
      categoryIndex: idx,
      previewPath,
      sourceAsset,
    });
  }

  const manifestPath = path.join(ROOT, "public/templates/previews/manifest.json");
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote ${entries.length} previews + ${manifestPath}`);
}

main();
