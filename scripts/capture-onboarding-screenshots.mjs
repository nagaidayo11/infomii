/**
 * Capture app onboarding screenshots from local dev (logged-in via Supabase admin magic link).
 * Usage: ONBOARDING_CAPTURE_EMAIL=you@example.com node scripts/capture-onboarding-screenshots.mjs
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_APP = path.join(ROOT, "public/onboarding/app");
const BASE = process.env.ONBOARDING_CAPTURE_BASE ?? "http://127.0.0.1:3000";

const LAUNCH_ONBOARDING_KEY = "infomii_launch_onboarding_v1_completed";

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

async function getMagicLink(env) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const preferred =
    process.env.ONBOARDING_CAPTURE_EMAIL?.trim() ||
    env.DEV_BUSINESS_OVERRIDE_EMAILS?.split(",")[0]?.trim() ||
    null;

  const makeLink = async (email) => {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${BASE}/dashboard?client=app` },
    });
    if (error) throw error;
    const link = data.properties?.action_link;
    if (!link) throw new Error("Failed to generate magic link.");
    return link;
  };

  if (preferred) {
    return { email: preferred, link: await makeLink(preferred) };
  }

  const { data: users, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 50 });
  if (listErr) throw listErr;
  const email = users.users.find((u) => u.email)?.email;
  if (!email) throw new Error("No Supabase users found for screenshot capture.");
  return { email, link: await makeLink(email) };
}

async function bootstrapSession(page, magicLink) {
  await page.goto(magicLink, { waitUntil: "networkidle", timeout: 120_000 });
  await page.evaluate((key) => localStorage.setItem(key, "1"), LAUNCH_ONBOARDING_KEY);
}

async function waitForDashboard(page) {
  await page.waitForURL(/\/dashboard/, { timeout: 60_000 });
  await page.waitForTimeout(800);
}

async function anonymizeGuestGreeting(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("h1")) {
      const text = el.textContent?.trim() ?? "";
      if (text.endsWith("さん")) {
        el.textContent = "ゲストさん";
      }
    }
  });
}

async function hideDevOverlays(page) {
  await page.addStyleTag({
    content: `
      [data-nextjs-dev-tools-button],
      [data-nextjs-toast],
      #devtools-indicator {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `,
  });
}

async function waitForDashboardReady(page) {
  await page.goto(`${BASE}/dashboard?client=app`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.locator("text=AIでつくる").first().waitFor({ timeout: 60_000 });
  await page
    .locator(".app-shell-skeleton")
    .first()
    .waitFor({ state: "detached", timeout: 60_000 })
    .catch(() => {});
  await page.waitForTimeout(1000);
}

async function captureDashboardAi(page, outPath) {
  await waitForDashboardReady(page);
  await anonymizeGuestGreeting(page);
  await hideDevOverlays(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: outPath, type: "png" });
  console.log("saved", path.relative(ROOT, outPath));
}

async function capture(page, outPath, { scrollTo, anonymize = false } = {}) {
  if (scrollTo) {
    const target = page.locator(scrollTo).first();
    if (await target.count()) {
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
    }
  }
  if (anonymize) {
    await anonymizeGuestGreeting(page);
  }
  await hideDevOverlays(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: outPath, type: "png" });
  console.log("saved", path.relative(ROOT, outPath));
}

const CAMP_TEMPLATE_SLUG = "travel-camp-outdoor";
const MARKETPLACE_SEED_VERSION = 13;

async function waitForTemplatesLoaded(page) {
  await page.getByRole("heading", { name: "テンプレート" }).waitFor({ timeout: 60_000 });
  await page
    .locator(".animate-pulse")
    .first()
    .waitFor({ state: "detached", timeout: 90_000 })
    .catch(() => {});
  await page.waitForTimeout(600);
}

async function ensureCampTemplateVisible(page) {
  await page.goto(`${BASE}/templates?client=app&starter=${CAMP_TEMPLATE_SLUG}`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await waitForTemplatesLoaded(page);

  let campCard = page.locator(`#template-${CAMP_TEMPLATE_SLUG}`);
  if (!(await campCard.count())) {
    await page.evaluate(async (version) => {
      await fetch(`/api/seed-templates?sync=1&v=${version}`);
    }, MARKETPLACE_SEED_VERSION);
    await page.reload({ waitUntil: "networkidle", timeout: 120_000 });
    await waitForTemplatesLoaded(page);
    campCard = page.locator(`#template-${CAMP_TEMPLATE_SLUG}`);
  }

  await campCard.waitFor({ timeout: 60_000 });
  await campCard.scrollIntoViewIfNeeded();
  return campCard;
}

async function findCampEditorPageId(page) {
  await page.goto(`${BASE}/dashboard/pages?client=app`, {
    waitUntil: "networkidle",
    timeout: 120_000,
  });
  await page.waitForTimeout(800);

  const existing = page.locator('a[href*="/editor/"]').filter({ hasText: /キャンプ|アウトドア|富士山麓/ });
  if (await existing.count()) {
    const href = await existing.first().getAttribute("href");
    const m = href?.match(/\/editor\/([^/?#]+)/);
    if (m?.[1]) return m[1];
  }

  const campCard = await ensureCampTemplateVisible(page);
  const useButton = campCard.getByRole("button", { name: /このテンプレートを使う|テンプレートを使う/ });
  await useButton.click();
  await page.waitForURL(/\/editor\/[^/?#]+/, { timeout: 120_000 });
  await page.waitForTimeout(2500);

  const m = page.url().match(/\/editor\/([^/?#]+)/);
  if (!m?.[1]) throw new Error("Failed to resolve editor page id after template create.");
  return m[1];
}

async function captureEditor(page, pageId, outPath) {
  await page.goto(`${BASE}/editor/${pageId}?client=app`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForTimeout(2500);
  await page.locator("text=富士山麓キャンプ").first().waitFor({ timeout: 30_000 }).catch(() => {});
  await hideDevOverlays(page);
  await page.waitForTimeout(500);
  await page.screenshot({ path: outPath, type: "png" });
  console.log("saved", path.relative(ROOT, outPath));
}

async function ensurePagePublishedAdmin(env, pageId) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("id,title,slug,hotel_id")
    .eq("id", pageId)
    .single();
  if (pageError || !page) {
    throw new Error(`Page not found for publish: ${pageId}`);
  }

  const now = new Date().toISOString();
  const { data: info } = await supabase
    .from("informations")
    .select("id")
    .eq("hotel_id", page.hotel_id)
    .eq("slug", page.slug)
    .maybeSingle();

  if (info?.id) {
    const { error } = await supabase
      .from("informations")
      .update({ status: "published", publish_at: now, unpublish_at: null })
      .eq("id", info.id);
    if (error) throw error;
    return;
  }

  const { error: insertError } = await supabase.from("informations").insert({
    hotel_id: page.hotel_id,
    title: page.title ?? "",
    body: "",
    images: [],
    content_blocks: [],
    theme: {},
    status: "published",
    publish_at: now,
    unpublish_at: null,
    slug: page.slug,
  });
  if (insertError) throw insertError;
}

async function capturePublishModal(page, pageId, outPath, env) {
  page.on("dialog", (dialog) => dialog.accept().catch(() => {}));

  await ensurePagePublishedAdmin(env, pageId);

  await page.goto(`${BASE}/editor/${pageId}?client=app`, {
    waitUntil: "networkidle",
    timeout: 120_000,
  });
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: "その他の操作" }).waitFor({ timeout: 60_000 });

  await page.getByRole("button", { name: "その他の操作" }).click();
  const sheet = page.locator(".app-bottom-sheet-panel");
  await sheet.waitFor({ state: "visible", timeout: 15_000 });
  await sheet.locator("button").filter({ hasText: "QRコード・公開URL" }).click();

  await page.locator("#publish-modal-title").waitFor({ timeout: 60_000 });
  await page
    .waitForFunction(() => {
      const img = document.querySelector("#publish-modal-title")?.closest('[role="dialog"]')?.querySelector("img");
      return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 32;
    }, { timeout: 30_000 })
    .catch(() => {});
  await hideDevOverlays(page);
  await page.waitForTimeout(800);
  await page.screenshot({ path: outPath, type: "png" });
  console.log("saved", path.relative(ROOT, outPath));
}

async function main() {
  const env = await loadEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env in .env.local");
  }

  await mkdir(OUT_APP, { recursive: true });

  const { email, link } = await getMagicLink(env);
  console.log("Capturing as", email);

  const browser = await chromium.launch({ headless: true });
  const appContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const appPage = await appContext.newPage();

  await bootstrapSession(appPage, link);
  await waitForDashboard(appPage);

  const campPageId = await findCampEditorPageId(appPage);
  console.log("Camp editor page:", campPageId);

  await ensureCampTemplateVisible(appPage);
  await capture(appPage, path.join(OUT_APP, "templates.png"));

  await captureEditor(appPage, campPageId, path.join(OUT_APP, "editor.png"));

  await captureDashboardAi(appPage, path.join(OUT_APP, "ai.png"));

  await capturePublishModal(appPage, campPageId, path.join(OUT_APP, "publish.png"), env);

  await appPage.goto(`${BASE}/dashboard/pages?client=app`, { waitUntil: "networkidle", timeout: 120_000 });
  await capture(appPage, path.join(OUT_APP, "works.png"), {
    scrollTo: "text=最近の作品",
  });

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
