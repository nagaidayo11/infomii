/**
 * BtoC テンプレの preview / hero 用 JPEG を public に配置する。
 * - 既存ファイルは上書きしない
 * - 新規 slug はカテゴリ別プールからコピー（本番前のプレースホルダー）
 * - 本番品質は docs/TEMPLATE_PREVIEW_IMAGE_MASTER_PROMPT.md + OpenAI 生成後に差し替え
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const POOL = {
  travel: [
    "/templates/previews/travel/travel-itinerary.jpg",
    "/templates/previews/travel/travel-weekend.jpg",
    "/templates/previews/travel/travel-group.jpg",
  ],
  oshi: [
    "/templates/previews/oshi/oshi-live-set.jpg",
    "/templates/previews/oshi/oshi-fan-meet.jpg",
    "/templates/previews/oshi/oshi-link-hub.jpg",
  ],
  personal: [
    "/templates/previews/personal/personal-date-plan.jpg",
    "/templates/previews/personal/personal-link-collection.jpg",
    "/templates/previews/personal/personal-event-guide.jpg",
  ],
  food: [
    "/preset-menu-hero-dining.jpg",
    "/preset-menu-thumb-food.jpg",
    "/preset-menu-hero-beverage.jpg",
    "/preset-menu-thumb-beverage.jpg",
    "/preset-menu-banner-category.jpg",
  ],
  lightbiz: [
    "/preset-menu-hero-salon.jpg",
    "/preset-menu-thumb-salon.jpg",
    "/preset-menu-hero-course.jpg",
    "/template-business-detail-01.jpg",
    "/template-guide-hero-01.jpg",
  ],
};

function parseBtocSlugs(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const entries = [];
  const re = /slug:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    entries.push({ slug: m[1], category: m[2] });
  }
  return entries;
}

function main() {
  const files = [
    path.join(ROOT, "src/lib/marketplace-seed-btoc.ts"),
    path.join(ROOT, "src/lib/marketplace-seed-btoc-expanded.ts"),
  ];
  const entries = files.flatMap(parseBtocSlugs);
  const seen = new Set();
  let created = 0;
  let skipped = 0;
  const categoryCount = new Map();

  for (const { slug, category } of entries) {
    const key = `${category}/${slug}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const destRel = `/templates/previews/${category}/${slug}.jpg`;
    const destAbs = path.join(ROOT, "public", destRel);
    if (fs.existsSync(destAbs)) {
      skipped += 1;
      continue;
    }

    const pool = POOL[category];
    if (!pool?.length) {
      console.warn(`No pool for category: ${category} (${slug})`);
      continue;
    }
    const idx = categoryCount.get(category) ?? 0;
    categoryCount.set(category, idx + 1);
    const srcRel = pool[idx % pool.length];
    const srcAbs = path.join(ROOT, "public", srcRel);
    if (!fs.existsSync(srcAbs)) {
      console.warn(`Missing source: ${srcRel}`);
      continue;
    }
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    fs.copyFileSync(srcAbs, destAbs);
    console.log(`+ ${destRel} <- ${srcRel}`);
    created += 1;
  }

  console.log(`Done. created=${created} skipped=${skipped} total=${seen.size}`);
}

main();
