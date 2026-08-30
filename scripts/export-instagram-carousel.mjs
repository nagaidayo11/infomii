/**
 * Export Infomii Instagram carousel slides to PNG (1080×1350).
 *
 * Usage:
 *   npm run instagram:export -- what-is-infomii
 *   npm run instagram:export -- what-is-infomii --scale 2
 *   npm run instagram:export -- what-is-infomii --scale 1
 *   npm run instagram:export -- what-is-infomii --open
 *
 * --scale N (default 2): capture at N× device pixel ratio, Lanczos downscale to 1080×1350.
 *
 * Post HTML (slides 1–4) + shared CTA (_cta-slide.html) → slide-01 … slide-05
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLUG = process.argv[2] || "what-is-infomii";
const OPEN_PREVIEW = process.argv.includes("--open");

function parseScale() {
  const idx = process.argv.indexOf("--scale");
  if (idx !== -1 && process.argv[idx + 1]) {
    const n = Number(process.argv[idx + 1]);
    if (Number.isFinite(n) && n >= 1 && n <= 4) return Math.round(n);
  }
  return 2;
}

const SCALE = parseScale();
const carouselsDir = path.join(ROOT, "docs/instagram/carousels");
const htmlPath = path.join(carouselsDir, `${SLUG}.html`);
const ctaPath = path.join(carouselsDir, "_cta-slide.html");
const outDir = path.join(ROOT, "docs/instagram/exports", SLUG);
const SLIDE_W = 1080;
const SLIDE_H = 1350;

async function writeSlidePng(buffer, outPath) {
  if (SCALE <= 1) {
    await sharp(buffer).png().toFile(outPath);
    return;
  }

  await sharp(buffer)
    .resize(SLIDE_W, SLIDE_H, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toFile(outPath);
}

async function screenshotSlides(page, slides, outDir, startIndex = 1) {
  const count = await slides.count();
  for (let i = 0; i < count; i++) {
    const slide = slides.nth(i);
    const n = String(startIndex + i).padStart(2, "0");
    const outPath = path.join(outDir, `slide-${n}.png`);
    const buffer = await slide.screenshot({ type: "png" });
    await writeSlidePng(buffer, outPath);
    console.log(`wrote ${path.relative(ROOT, outPath)} (${SCALE}x → ${SLIDE_W}×${SLIDE_H})`);
  }
  return count;
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: !OPEN_PREVIEW });
  const page = await browser.newPage({
    viewport: { width: SLIDE_W + 80, height: SLIDE_H + 80 },
    deviceScaleFactor: SCALE,
  });

  // Slides 1–4 from post
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const postSlides = page.locator(".slide");
  const postCount = await screenshotSlides(page, postSlides, outDir, 1);
  if (postCount === 0) {
    throw new Error(`No .slide elements found in ${htmlPath}`);
  }

  // Slide 5 from shared CTA
  await page.goto(pathToFileURL(ctaPath).href, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const ctaSlides = page.locator(".slide");
  const ctaCount = await ctaSlides.count();
  if (ctaCount !== 1) {
    throw new Error(`Expected 1 slide in ${ctaPath}, found ${ctaCount}`);
  }
  await screenshotSlides(page, ctaSlides, outDir, postCount + 1);

  await browser.close();
  console.log(`\nDone: ${postCount + ctaCount} slides → ${path.relative(ROOT, outDir)} (scale ${SCALE})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
