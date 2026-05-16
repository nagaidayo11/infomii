import {
  SEED_TEMPLATES,
  applyTemplateMediaDefaults,
  diversifyTemplateBlocks,
  normalizeTemplateComposition,
} from "../src/app/api/seed-templates/route.ts";

const categoryIndexMap = new Map<string, number>();
let iconHits = 0;
let underSix = 0;

for (const template of SEED_TEMPLATES) {
  const categoryKey = template.category ?? "default";
  const categoryIndex = categoryIndexMap.get(categoryKey) ?? 0;
  categoryIndexMap.set(categoryKey, categoryIndex + 1);

  const normalized = normalizeTemplateComposition(
    diversifyTemplateBlocks(applyTemplateMediaDefaults(template, categoryIndex), categoryIndex),
  );

  const icons = normalized.cards.filter((c) => c.type === "icon");
  if (icons.length > 0) {
    iconHits += icons.length;
    console.error(`icon in pipeline output: ${template.name} (${icons.length})`);
  }
  if (normalized.cards.length < 6) {
    underSix += 1;
    console.error(`under 6 cards: ${template.name} (${normalized.cards.length})`);
  }
}

console.log(`templates: ${SEED_TEMPLATES.length}`);
console.log(`icon blocks after pipeline: ${iconHits}`);
console.log(`templates under 6 cards: ${underSix}`);

if (iconHits > 0 || underSix > 0) process.exit(1);
