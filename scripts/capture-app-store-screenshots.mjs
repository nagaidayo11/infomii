/**
 * Capture App Store screenshots (group travel / Okinawa theme, client=app shell).
 *
 * Usage:
 *   npm run dev   # separate terminal
 *   npm run app-store:capture-screenshots
 *
 * Optional: ONBOARDING_CAPTURE_EMAIL=you@example.com
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public/app-store/screenshots/raw");
const BASE = process.env.APP_STORE_CAPTURE_BASE ?? "http://127.0.0.1:3000";

const LAUNCH_ONBOARDING_KEY = "infomii_launch_onboarding_v1_completed";
const TEMPLATE_SLUG = "travel-group";
const MARKETPLACE_SEED_VERSION = 15;
const SAMPLE_SLUG = "okinawa-group-sample";
const SAMPLE_URL = `https://www.infomii.com/v/${SAMPLE_SLUG}`;
const SAMPLE_TITLE = "沖縄、3泊5人";
const GUEST_DEMO_PATH = "/demo/okinawa-group-sample";

const VIEWPORT = { width: 430, height: 932 };
const DEVICE_SCALE = 3;

async function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  const raw = await readFile(envPath, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return env;
}

function resolveCaptureCredentials(env) {
  const email =
    process.env.APP_STORE_CAPTURE_EMAIL?.trim() ||
    process.env.ONBOARDING_CAPTURE_EMAIL?.trim() ||
    (env.APP_STORE_REVIEW_PASSWORD ? "review@infomii.com" : null) ||
    env.DEV_BUSINESS_OVERRIDE_EMAILS?.split(",")[0]?.trim() ||
    null;
  const password =
    process.env.APP_STORE_CAPTURE_PASSWORD?.trim() ||
    env.APP_STORE_REVIEW_PASSWORD?.trim() ||
    null;
  if (!email || !password) {
    throw new Error(
      "Set APP_STORE_REVIEW_PASSWORD in .env.local (review@infomii.com) or APP_STORE_CAPTURE_EMAIL + APP_STORE_CAPTURE_PASSWORD.",
    );
  }
  return { email, password };
}

async function loginForCapture(page, env) {
  const { email, password } = resolveCaptureCredentials(env);
  const next = encodeURIComponent("/dashboard?client=app");
  await page.goto(`${BASE}/login?client=app&next=${next}`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.evaluate((key) => {
    localStorage.setItem(key, "1");
    localStorage.setItem("infomii_app_onboarding_completed", "1");
    localStorage.setItem("infomii_onboarding_tour_completed", "1");
  }, LAUNCH_ONBOARDING_KEY);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.getByRole("button", { name: "メールでログイン" }).click();
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/, { timeout: 90_000 });
  await page.locator("text=AIでつくる").first().waitFor({ timeout: 60_000 });
  console.log("Logged in as", email);
}

const DEV_OVERLAY_HIDE_CSS = `
  [data-nextjs-dev-tools-button],
  [data-nextjs-toast],
  #devtools-indicator,
  nextjs-portal,
  [data-nextjs-dev-tools-overlay],
  [data-next-badge-root],
  [data-nextjs-dev-tools-menu],
  #nextjs__container_build_indicator,
  [class*="nextjs-toast"],
  [class*="dev-tools"] {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
    opacity: 0 !important;
  }
`;

function devOverlayInitScript() {
  const purge = () => {
    for (const selector of ["nextjs-portal", "[data-next-badge-root]", "[data-nextjs-dev-tools-button]"]) {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    }
    for (const el of document.querySelectorAll("button, a, div, span")) {
      const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
      if (!text) continue;
      if (/^N?\s*\d+\s*Issue/i.test(text) || /^\\d+\s*Issue$/i.test(text)) {
        el.closest("button, nextjs-portal, div")?.remove();
      }
    }
  };
  purge();
  new MutationObserver(purge).observe(document.documentElement, { childList: true, subtree: true });
}

async function hideDevOverlays(page) {
  await page.addStyleTag({ content: DEV_OVERLAY_HIDE_CSS });
  await page.evaluate(devOverlayInitScript).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal, [data-next-badge-root]").forEach((el) => el.remove());
    for (const el of document.querySelectorAll("button, a,div, span")) {
      const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
      if (/^N?\s*\d+\s*Issue/i.test(text) || /^\\d+\s*Issue$/i.test(text)) {
        el.closest("button, nextjs-portal, div")?.remove();
      }
    }
  });
}

let fakeQrDataUrlPromise;

async function getFakeQrDataUrl() {
  if (!fakeQrDataUrlPromise) {
    fakeQrDataUrlPromise = readFile(path.join(ROOT, "public/app-store/demo-qr-placeholder.png")).then(
      (png) => `data:image/png;base64,${png.toString("base64")}`,
    );
  }
  return fakeQrDataUrlPromise;
}

async function capture(page, outPath) {
  await hideDevOverlays(page);
  await page.waitForTimeout(250);
  await hideDevOverlays(page);
  await page.waitForTimeout(250);
  await page.screenshot({ path: outPath, type: "png" });
  console.log("saved", path.relative(ROOT, outPath));
}

async function centerTemplateCard(page, slug) {
  await page.waitForTimeout(800);
  await page.evaluate((templateSlug) => {
    const card = document.getElementById(`template-${templateSlug}`);
    if (!card) return;

    const scroller = card.closest('[role="region"]');
    if (scroller instanceof HTMLElement) {
      scroller.scrollLeft = 0;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      scroller.scrollLeft = Math.max(0, cardCenter - scroller.clientWidth / 2);

      const cardRect = card.getBoundingClientRect();
      const viewportCenterX = window.innerWidth / 2;
      const cardCenterX = cardRect.left + cardRect.width / 2;
      scroller.scrollLeft += cardCenterX - viewportCenterX;
    }

    const main = document.querySelector(".app-shell-main");
    const scrollRoot = main instanceof HTMLElement ? main : document.scrollingElement;
    if (!(scrollRoot instanceof HTMLElement)) return;

    scrollRoot.scrollTop = 0;
    let cardRect = card.getBoundingClientRect();
    const bottomNav = document.querySelector("nav");
    const bottomNavHeight = bottomNav?.getBoundingClientRect().height ?? 72;
    const contentCenterY = (window.innerHeight - bottomNavHeight) / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;
    scrollRoot.scrollTop += cardCenterY - contentCenterY;
  }, slug);
  await page.waitForTimeout(400);
}

async function resetEditorFrameForCapture(page) {
  await page.evaluate(() => {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty("--infomii-safe-top", "0px");
    document.documentElement.style.setProperty("--infomii-safe-bottom", "0px");
    document.documentElement.style.setProperty("--infomii-safe-top-fallback", "0px");
    document.documentElement.style.setProperty("--infomii-safe-bottom-fallback", "0px");

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);

    for (const el of document.querySelectorAll("*")) {
      if (!(el instanceof HTMLElement)) continue;
      const { overflowY } = getComputedStyle(el);
      if (overflowY === "auto" || overflowY === "scroll") el.scrollTop = 0;
    }

    const layout = document.querySelector("[data-editor-layout]");
    if (layout instanceof HTMLElement) {
      layout.style.height = `${vh}px`;
      layout.style.maxHeight = `${vh}px`;
      layout.style.minHeight = `${vh}px`;
    }
  });
}

async function stylizeAiHomeForAppStore(page) {
  await page.evaluate(() => {
    const header = document.querySelector("header.app-reveal, header");
    const h1 = header?.querySelector("h1");
    if (h1) h1.textContent = "ゲストさん";

    header?.querySelectorAll("p").forEach((el) => {
      const text = el.textContent?.trim() ?? "";
      if (text.includes("App Store") || text.includes("審査")) el.remove();
    });

    document.querySelectorAll(".app-reveal").forEach((el) => {
      if (el.querySelector('a[href*="/editor/"]') && el.textContent?.includes("App Store 審査")) {
        el.remove();
      }
    });
  });
  const textarea = page.locator("textarea").first();
  if (await textarea.count()) {
    await textarea.fill(
      "友達5人で沖縄3泊の旅行。飛行機・レンタカー・宿・役割分担とリンクを1ページに。",
    );
  }
}

async function waitForRouteProgressHidden(page) {
  await page
    .waitForFunction(
      () => {
        const host = document.querySelector(".app-route-progress-bar")?.parentElement;
        if (!host) return true;
        const opacity = getComputedStyle(host).opacity;
        return opacity === "0" || Number.parseFloat(opacity) < 0.05;
      },
      { timeout: 60_000 },
    )
    .catch(() => {});
  await page.waitForTimeout(400);
}

async function waitForTemplatesLoaded(page) {
  await page.getByRole("heading", { name: "テンプレート" }).waitFor({ timeout: 60_000 });
  await page
    .locator(".animate-pulse")
    .first()
    .waitFor({ state: "detached", timeout: 90_000 })
    .catch(() => {});
  await page.waitForTimeout(600);
}

async function markTemplateSeedSynced(page) {
  await page.evaluate((version) => {
    try {
      sessionStorage.setItem(`infomii-template-seed-v${version}`, "done");
    } catch {
      /* ignore */
    }
  }, MARKETPLACE_SEED_VERSION);
}

async function ensureTravelTemplateVisible(page) {
  await markTemplateSeedSynced(page);
  await page.goto(`${BASE}/templates?client=app&category=travel&starter=${TEMPLATE_SLUG}`, {
    waitUntil: "networkidle",
    timeout: 120_000,
  });
  await waitForTemplatesLoaded(page);
  await waitForRouteProgressHidden(page);

  let card = page.locator(`#template-${TEMPLATE_SLUG}`);
  if (!(await card.count())) {
    await page.evaluate(async (version) => {
      await fetch(`/api/seed-templates?sync=1&v=${version}`);
    }, MARKETPLACE_SEED_VERSION);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120_000 });
    await waitForTemplatesLoaded(page);
    card = page.locator(`#template-${TEMPLATE_SLUG}`);
  }

  await card.waitFor({ timeout: 60_000 });
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  return card;
}

async function findGroupEditorPageId(page) {
  await page.goto(`${BASE}/dashboard/pages?client=app`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.waitForTimeout(800);

  const existing = page
    .locator('a[href*="/editor/"]')
    .filter({ hasText: /沖縄|3泊5人|役割分担|グループ旅行/ });
  if (await existing.count()) {
    const href = await existing.first().getAttribute("href");
    const m = href?.match(/\/editor\/([^/?#]+)/);
    if (m?.[1]) return m[1];
  }

  const travelCard = await ensureTravelTemplateVisible(page);
  const useButton = travelCard.getByRole("button", { name: /このテンプレートを使う|テンプレートを使う/ });
  await useButton.click();
  await page.waitForURL(/\/editor\/[^/?#]+/, { timeout: 120_000 });
  await page.waitForTimeout(2500);

  const m = page.url().match(/\/editor\/([^/?#]+)/);
  if (!m?.[1]) throw new Error("Failed to resolve editor page id after template create.");
  return m[1];
}

async function renamePageForCapture(env, pageId) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await supabase
    .from("pages")
    .update({ title: SAMPLE_TITLE, slug: `${SAMPLE_SLUG}-draft` })
    .eq("id", pageId);
  if (error) {
    console.warn("renamePageForCapture skipped:", error.message);
  }
}

async function captureTemplates(page, outPath) {
  await ensureTravelTemplateVisible(page);
  await centerTemplateCard(page, TEMPLATE_SLUG);
  await waitForRouteProgressHidden(page);
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("a, button")) {
      if (el.textContent?.includes("ダッシュボード")) el.remove();
    }
  });
  await capture(page, outPath);
}

async function captureAiHome(page, outPath) {
  await page.goto(`${BASE}/dashboard?client=app`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.locator("text=AIでつくる").first().waitFor({ timeout: 60_000 });
  await page
    .locator(".app-shell-skeleton")
    .first()
    .waitFor({ state: "detached", timeout: 60_000 })
    .catch(() => {});
  await stylizeAiHomeForAppStore(page);
  await page.waitForTimeout(800);
  await capture(page, outPath);
}

async function captureEditor(page, pageId, outPath) {
  await page.goto(`${BASE}/editor/${pageId}?client=app`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(3000);
  await page.locator("text=沖縄、3泊5人").first().waitFor({ timeout: 30_000 }).catch(() => {});

  const linkCard = page.locator("[data-card-id]").filter({ hasText: "航空券" }).first();
  if (await linkCard.count()) {
    await linkCard.click();
  } else {
    await page.locator("[data-card-id]").filter({ hasText: "リンク" }).first().click();
  }
  await page.getByRole("button", { name: "ブロック設定を開く" }).click();
  await page.waitForTimeout(800);
  const columnsSelect = page.locator('label:has-text("列数")').locator("..").locator("select").first();
  if (await columnsSelect.count()) {
    await columnsSelect.selectOption("2");
    await page.waitForTimeout(400);
  }
  await page.waitForTimeout(400);
  await resetEditorFrameForCapture(page);
  await hideDevOverlays(page);
  await page.waitForTimeout(300);
  const layout = page.locator("[data-editor-layout]");
  await layout.waitFor({ timeout: 30_000 });
  await layout.screenshot({ path: outPath, type: "png" });
  console.log("saved", path.relative(ROOT, outPath));
}

async function stylizePublishModalForAppStore(page) {
  const qr = await getFakeQrDataUrl();
  await page.evaluate(
    ({ url, title, qrSrc }) => {
      const dialog = document.querySelector("#publish-modal-title")?.closest('[role="dialog"]');
      if (!dialog) return;
      const input = dialog.querySelector('input[aria-label="Public page URL"]');
      if (input instanceof HTMLInputElement) input.value = url;
      const subtitle = document.querySelector("#publish-modal-title")?.nextElementSibling;
      if (subtitle) subtitle.textContent = title;
      const img = dialog.querySelector("img");
      if (img instanceof HTMLImageElement) {
        img.src = qrSrc;
        img.alt = "";
      }
    },
    { url: SAMPLE_URL, title: SAMPLE_TITLE, qrSrc: qr },
  );
  await page.waitForFunction(() => {
    const img = document.querySelector("#publish-modal-title")?.closest('[role="dialog"]')?.querySelector("img");
    return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 32;
  }, { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(500);
}

async function capturePublishModal(page, outPath) {
  await page.goto(`${BASE}/demo/app-store/publish?client=app`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.locator("#publish-modal-title").waitFor({ timeout: 60_000 });
  await stylizePublishModalForAppStore(page);
  await capture(page, outPath);
}

async function resetGuestFrameForCapture(page) {
  await page.evaluate(() => {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty("--infomii-safe-top", "0px");
    document.documentElement.style.setProperty("--infomii-safe-bottom", "0px");
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);

    for (const el of document.querySelectorAll("*")) {
      if (!(el instanceof HTMLElement)) continue;
      const { overflowY } = getComputedStyle(el);
      if (overflowY === "auto" || overflowY === "scroll") el.scrollTop = 0;
    }

    const shell = document.querySelector("[data-guest-page-shell]");
    if (shell instanceof HTMLElement) {
      shell.style.height = `${vh}px`;
      shell.style.maxHeight = `${vh}px`;
    }
  });
}

async function captureGuestDemo(page, outPath) {
  await page.goto(`${BASE}${GUEST_DEMO_PATH}`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.locator("text=沖縄、3泊5人").first().waitFor({ timeout: 60_000 });
  await page.waitForTimeout(800);
  await resetGuestFrameForCapture(page);
  await hideDevOverlays(page);
  await page.waitForTimeout(300);
  const shell = page.locator("[data-guest-page-shell]");
  await shell.waitFor({ timeout: 30_000 });
  await shell.screenshot({ path: outPath, type: "png" });
  console.log("saved", path.relative(ROOT, outPath));
}

async function captureBilling(page, outPath) {
  await page.goto(`${BASE}/settings/billing?client=app`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.getByRole("heading", { name: "プラン" }).first().waitFor({ timeout: 60_000 });
  await page.waitForTimeout(600);
  await hideDevOverlays(page);
  await capture(page, outPath);
}

async function main() {
  const env = await loadEnv();
  const only = process.env.APP_STORE_CAPTURE_ONLY?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const shouldCapture = (name) => !only?.length || only.includes(name);
  const needsAuth = shouldCapture("01") || shouldCapture("02") || shouldCapture("03") || shouldCapture("06");
  const needsSupabase = shouldCapture("03");

  await mkdir(OUT_DIR, { recursive: true });

  if (needsSupabase && (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)) {
    throw new Error("Missing Supabase env in .env.local");
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE,
    isMobile: true,
    hasTouch: true,
  });
  await context.addInitScript(devOverlayInitScript);
  const page = await context.newPage();

  if (needsAuth) {
    const { email } = resolveCaptureCredentials(env);
    console.log("Capturing as", email);
    await loginForCapture(page, env);
    await page.waitForTimeout(800);
  } else {
    console.log("Capturing public demo pages (no login)");
  }

  let editorPageId = null;
  if (shouldCapture("03")) {
    editorPageId = await findGroupEditorPageId(page);
    console.log("Group travel editor page:", editorPageId);
    await renamePageForCapture(env, editorPageId);
  }

  if (shouldCapture("01")) {
    await captureTemplates(page, path.join(OUT_DIR, "01-templates.png"));
  }
  if (shouldCapture("02")) {
    await captureAiHome(page, path.join(OUT_DIR, "02-ai-home.png"));
  }
  if (shouldCapture("03")) {
    await captureEditor(page, editorPageId, path.join(OUT_DIR, "03-editor.png"));
  }
  if (shouldCapture("04")) {
    await capturePublishModal(page, path.join(OUT_DIR, "04-publish.png"));
  }
  if (shouldCapture("05")) {
    await captureGuestDemo(page, path.join(OUT_DIR, "05-guest.png"));
  }
  if (shouldCapture("06")) {
    await captureBilling(page, path.join(OUT_DIR, "06-billing.png"));
  }

  await browser.close();
  console.log("Done. Output:", path.relative(ROOT, OUT_DIR));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
