/**
 * Build Infomii SNS profile icon + X header from the existing glossy “i” mark.
 *
 * Usage: node scripts/build-sns-assets.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs/sns");
const ICON_SRC = path.join(ROOT, "apps/mobile/assets/icon.png");
const AI_BANNER = path.join(OUT, "_src/sns-banner-x.png");
const AI_BANNER_BG = path.join(OUT, "_src/sns-banner-bg.png");

const TEAL = { r: 22, g: 197, b: 154, alpha: 1 };
const X_BANNER = { w: 1500, h: 500 };
const ICON = 1024;

function isOuterBg(r, g, b, a) {
  if (a < 10) return true;
  if (r < 18 && g < 18 && b < 18) return true;
  if (r > 248 && g > 248 && b > 248) return true;
  return false;
}

async function extractSquircle(srcPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (!isOuterBg(data[i], data[i + 1], data[i + 2], data[i + 3] ?? 255)) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 2;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const extractWidth = Math.min(width - left, maxX - minX + 1 + pad * 2);
  const extractHeight = Math.min(height - top, maxY - minY + 1 + pad * 2);

  const cropped = await sharp(srcPath)
    .extract({ left, top, width: extractWidth, height: extractHeight })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.from(cropped.data);
  for (let i = 0; i < out.length; i += cropped.info.channels) {
    if (isOuterBg(out[i], out[i + 1], out[i + 2], out[i + 3] ?? 255)) {
      out[i] = TEAL.r;
      out[i + 1] = TEAL.g;
      out[i + 2] = TEAL.b;
      out[i + 3] = 0;
    }
  }
  return sharp(out, {
    raw: {
      width: cropped.info.width,
      height: cropped.info.height,
      channels: cropped.info.channels,
    },
  }).png();
}

async function writeIconOnTeal(squirclePng, size, outPath, { fill = 0.86 } = {}) {
  const meta = await squirclePng.metadata();
  const side = Math.round(size * fill);
  const resized = await squirclePng
    .clone()
    .resize(side, side, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const left = Math.round((size - side) / 2);
  const top = Math.round((size - side) / 2);
  await sharp({
    create: { width: size, height: size, channels: 4, background: TEAL },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toFile(outPath);
}

async function writeIconBleed(srcPath, size, outPath) {
  // Crop the inner square of the squircle so circle-crop is full-bleed gloss.
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      if (!isOuterBg(data[i], data[i + 1], data[i + 2], data[i + 3] ?? 255)) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const inset = Math.round(Math.min(bw, bh) * 0.08);
  await sharp(srcPath)
    .extract({
      left: minX + inset,
      top: minY + inset,
      width: bw - inset * 2,
      height: bh - inset * 2,
    })
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(outPath);
}

async function cropBannerToX(srcPath, outPath) {
  const meta = await sharp(srcPath).metadata();
  const w = meta.width ?? 1376;
  const h = meta.height ?? 768;
  const targetRatio = X_BANNER.w / X_BANNER.h;
  let extractW = w;
  let extractH = Math.round(w / targetRatio);
  if (extractH > h) {
    extractH = h;
    extractW = Math.round(h * targetRatio);
  }
  const left = Math.round((w - extractW) / 2);
  const top = Math.round((h - extractH) / 2);
  await sharp(srcPath)
    .extract({ left, top, width: extractW, height: extractH })
    .resize(X_BANNER.w, X_BANNER.h, { fit: "fill", kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(outPath);
}

async function writeBannerHtml(outPath) {
  const html = `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; margin: 0; }
      .banner {
        position: relative;
        width: 1500px;
        height: 500px;
        overflow: hidden;
        background: #04372d;
      }
      .banner img.bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 78% 50%;
      }
      .veil {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          rgba(4, 45, 38, 0.82) 0%,
          rgba(6, 78, 59, 0.46) 44%,
          rgba(15, 118, 110, 0.08) 100%
        );
      }
      .lockup {
        position: absolute;
        left: 96px;
        top: 72px;
        display: flex;
        align-items: center;
        gap: 40px;
      }
      .mark {
        width: 252px;
        height: 252px;
        object-fit: contain;
        filter: drop-shadow(0 18px 28px rgba(2, 24, 20, 0.38));
      }
      .copy { color: #fff; font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", sans-serif; }
      .wordmark {
        font-size: 96px;
        font-weight: 800;
        letter-spacing: -1.2px;
        line-height: 1;
      }
      .wordmark .ii { color: #a7f3d0; }
      .ja {
        margin-top: 20px;
        font-size: 32px;
        font-weight: 600;
        letter-spacing: 0.06em;
        color: #ecfdf5;
      }
      .en {
        margin-top: 14px;
        font-size: 22px;
        font-weight: 500;
        letter-spacing: 0.02em;
        color: #d1fae5;
        opacity: 0.92;
        font-family: "Helvetica Neue", "Hiragino Sans", sans-serif;
      }
    </style>
  </head>
  <body>
    <div class="banner" id="banner">
      <img class="bg" src="./_banner-bg-1500x500.png" alt="" />
      <div class="veil"></div>
      <div class="lockup">
        <img class="mark" src="./icon-mark.png" alt="" />
        <div class="copy">
          <div class="wordmark">Infom<span class="ii">ii</span></div>
          <div class="ja">誰でも爆速で案内が作れる</div>
          <div class="en">Hotel information, instantly.</div>
        </div>
      </div>
    </div>
  </body>
</html>
`;
  await writeFile(outPath, html, "utf8");
}

async function screenshotBanner(htmlPath, outPath) {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: X_BANNER.w, height: X_BANNER.h },
    deviceScaleFactor: 2,
  });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  const banner = page.locator("#banner");
  const buffer = await banner.screenshot({ type: "png" });
  await browser.close();
  await sharp(buffer)
    .resize(X_BANNER.w, X_BANNER.h, { fit: "fill", kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(outPath);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const squircle = await extractSquircle(ICON_SRC);
  const squircleBuf = await squircle.png().toBuffer();

  await sharp(squircleBuf).png().toFile(path.join(OUT, "icon-mark.png"));
  await writeIconOnTeal(sharp(squircleBuf), ICON, path.join(OUT, "icon-1024.png"));
  await writeIconOnTeal(sharp(squircleBuf), 400, path.join(OUT, "icon-x-400.png"));
  await writeIconBleed(ICON_SRC, ICON, path.join(OUT, "icon-bleed-1024.png"));

  await cropBannerToX(AI_BANNER, path.join(OUT, "banner-x-ai-1500x500.png"));
  await cropBannerToX(AI_BANNER_BG, path.join(OUT, "_banner-bg-1500x500.png"));
  await writeBannerHtml(path.join(OUT, "banner.html"));
  await screenshotBanner(path.join(OUT, "banner.html"), path.join(OUT, "banner-x-1500x500.png"));

  console.log("wrote", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
