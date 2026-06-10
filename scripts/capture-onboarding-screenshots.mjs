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

const LAUNCH_ONBOARDING_KEY = "infomii_launch_onboarding_v2_completed";

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

async function getMagicLinkForEmail(env, email) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${BASE}/dashboard?client=app` },
  });
  if (error) throw error;
  const link = data.properties?.action_link;
  if (!link) throw new Error("Failed to generate magic link.");
  return { email, link };
}

function resolveCaptureEmail(env) {
  if (process.env.ONBOARDING_CAPTURE_EMAIL?.trim()) {
    return process.env.ONBOARDING_CAPTURE_EMAIL.trim();
  }
  const devEmail = env.DEV_BUSINESS_OVERRIDE_EMAILS?.split(",")[0]?.trim();
  if (devEmail) return devEmail;
  if (env.APP_STORE_REVIEW_PASSWORD) return "review@infomii.com";
  return null;
}

function resolveCapturePassword(env, email) {
  return (
    process.env.ONBOARDING_CAPTURE_PASSWORD?.trim() ||
    process.env.APP_STORE_CAPTURE_PASSWORD?.trim() ||
    (email?.toLowerCase() === "review@infomii.com" ? env.APP_STORE_REVIEW_PASSWORD?.trim() : null) ||
    null
  );
}

async function markOnboardingSkipped(page) {
  await page.evaluate((key) => {
    localStorage.setItem(key, "1");
    localStorage.setItem("infomii_app_onboarding_completed", "1");
    localStorage.setItem("infomii_app_onboarding_v2_completed", "1");
    localStorage.setItem("infomii_onboarding_tour_completed", "1");
  }, LAUNCH_ONBOARDING_KEY);
}

function supabaseAuthStorageKey(env) {
  const host = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  const projectRef = host.split(".")[0];
  return `sb-${projectRef}-auth-token`;
}

async function createCaptureSession(env, email) {
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${BASE}/dashboard?client=app` },
  });
  if (error) throw error;

  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) throw new Error("Failed to generate auth token for capture session.");

  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: verified, error: verifyError } = await anon.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });
  if (verifyError || !verified.session) {
    throw verifyError ?? new Error("Failed to verify capture session.");
  }
  return verified.session;
}

async function loginWithPassword(page, email, password) {
  const next = encodeURIComponent("/dashboard?client=app");
  await page.goto(`${BASE}/login?client=app&next=${next}`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await markOnboardingSkipped(page);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.getByRole("button", { name: "メールでログイン" }).click();
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/, { timeout: 90_000 });
  await page.locator("text=AIでつくる").first().waitFor({ timeout: 60_000 });
  await page.waitForTimeout(800);
}

async function loginForCapture(page, env, email) {
  const password = resolveCapturePassword(env, email);
  if (password) {
    try {
      await loginWithPassword(page, email, password);
      return;
    } catch (error) {
      console.warn("Password login failed, falling back to admin session injection.", error);
    }
  }

  const session = await createCaptureSession(env, email);
  const storageKey = supabaseAuthStorageKey(env);
  await page.goto(`${BASE}/login?client=app`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.evaluate(
    ({ storageKey, session, onboardingKey }) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          expires_in: session.expires_in,
          token_type: session.token_type,
          user: session.user,
        }),
      );
      localStorage.setItem(onboardingKey, "1");
      localStorage.setItem("infomii_app_onboarding_completed", "1");
      localStorage.setItem("infomii_app_onboarding_v2_completed", "1");
      localStorage.setItem("infomii_onboarding_tour_completed", "1");
    },
    { storageKey, session, onboardingKey: LAUNCH_ONBOARDING_KEY },
  );
  await page.goto(`${BASE}/dashboard?client=app`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.locator("text=AIでつくる").first().waitFor({ timeout: 60_000 });
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
      if (/^N?\s*\d+\s*Issue/i.test(text) || /^\d+\s*Issue$/i.test(text)) {
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
    for (const el of document.querySelectorAll("button, a, div, span")) {
      const text = el.textContent?.replace(/\s+/g, " ").trim() ?? "";
      if (/^N?\s*\d+\s*Issue/i.test(text) || /^\d+\s*Issue$/i.test(text)) {
        el.closest("button, nextjs-portal, div")?.remove();
      }
    }
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
const MARKETPLACE_SEED_VERSION = 15;

const captureOnly = new Set(
  process.argv.slice(2).flatMap((arg) => arg.split(",").map((s) => s.trim()).filter(Boolean)),
);
const shouldCapture = (name) => captureOnly.size === 0 || captureOnly.has(name);

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

async function findCampPageIdViaAdmin(env, email) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let userId = null;
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) {
      userId = hit.id;
      break;
    }
    if (data.users.length < 100) break;
  }
  if (!userId) return null;

  const { data: membership, error: memberError } = await supabase
    .from("hotel_memberships")
    .select("hotel_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (memberError) throw memberError;
  if (!membership?.hotel_id) return null;

  const { data: pages, error: pagesError } = await supabase
    .from("pages")
    .select("id,title")
    .eq("hotel_id", membership.hotel_id);
  if (pagesError) throw pagesError;

  const camp = (pages ?? []).find((row) => /キャンプ|アウトドア|富士山麓/.test(row.title ?? ""));
  return camp?.id ?? null;
}

async function findCampEditorPageId(page, env, email) {
  const viaAdmin = await findCampPageIdViaAdmin(env, email);
  if (viaAdmin) return viaAdmin;

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

async function patchCampPageLinksColumns(env, pageId) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: cards, error } = await supabase
    .from("cards")
    .select("id, content")
    .eq("page_id", pageId)
    .eq("type", "pageLinks");
  if (error) throw error;

  for (const card of cards ?? []) {
    const content = { ...(card.content ?? {}), columns: 2 };
    const { error: updateError } = await supabase.from("cards").update({ content }).eq("id", card.id);
    if (updateError) throw updateError;
  }
}

async function waitForEditorPublished(page) {
  await page.locator("text=非公開です").waitFor({ state: "detached", timeout: 30_000 }).catch(() => {});
  await page.getByLabel("ゲスト向けの公開", { exact: true }).waitFor({ timeout: 30_000 }).catch(() => {});
}

async function captureEditor(page, pageId, outPath, env) {
  await patchCampPageLinksColumns(env, pageId);
  await ensurePagePublishedAdmin(env, pageId);

  await page.goto(`${BASE}/editor/${pageId}?client=app`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(3000);
  await page.locator("text=富士山麓キャンプ").first().waitFor({ timeout: 30_000 }).catch(() => {});
  await page.locator("text=キャンプ導線").first().waitFor({ timeout: 30_000 }).catch(() => {});
  await waitForEditorPublished(page);
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

async function waitForPublishModal(page) {
  await page.locator("#publish-modal-title").waitFor({ timeout: 60_000 });
  await page.getByRole("heading", { name: "公開しました" }).waitFor({ timeout: 15_000 });
  await page
    .waitForFunction(() => {
      const img = document.querySelector("#publish-modal-title")?.closest('[role="dialog"]')?.querySelector("img");
      return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 32;
    }, { timeout: 30_000 })
    .catch(() => {});
}

async function openPublishSuccessModalFromEditor(page, pageId, env) {
  page.on("dialog", (dialog) => dialog.accept().catch(() => {}));

  await ensurePagePublishedAdmin(env, pageId);

  await page.goto(`${BASE}/editor/${pageId}?client=app`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  await page.waitForTimeout(3500);
  await page.locator("text=富士山麓キャンプ").first().waitFor({ timeout: 30_000 }).catch(() => {});
  await waitForEditorPublished(page);

  const appQrButton = page.getByRole("button", { name: "QRとリンク" });
  const webQrButton = page.getByRole("button", { name: "QRコードとURLを表示" });
  if (await appQrButton.count()) {
    await appQrButton.first().click();
  } else if (await webQrButton.count()) {
    await webQrButton.first().click();
  } else {
    const moreButton = page.getByRole("button", { name: "その他の操作" });
    await moreButton.waitFor({ timeout: 60_000 });
    await moreButton.click();
    await page.locator(".app-bottom-sheet-panel, [role='menu']").first().waitFor({ timeout: 15_000 });
    await page.locator("button, [role='menuitem']").filter({ hasText: /QR/ }).first().click();
  }

  await waitForPublishModal(page);
}

async function openPublishSuccessModal(page, pageId, env) {
  await openPublishSuccessModalFromEditor(page, pageId, env);
}

async function capturePublishModal(page, pageId, outPath, env) {
  await openPublishSuccessModal(page, pageId, env);
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

  const email = resolveCaptureEmail(env) ?? (await getMagicLink(env)).email;
  console.log("Capturing as", email);

  const browser = await chromium.launch({ headless: true });
  const appContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  await appContext.addInitScript(devOverlayInitScript);
  const appPage = await appContext.newPage();

  await loginForCapture(appPage, env, email);

  const campPageId = await findCampEditorPageId(appPage, env, email);
  console.log("Camp editor page:", campPageId);

  if (shouldCapture("templates")) {
    await ensureCampTemplateVisible(appPage);
    await capture(appPage, path.join(OUT_APP, "templates.png"));
  }

  if (shouldCapture("editor")) {
    await captureEditor(appPage, campPageId, path.join(OUT_APP, "editor.png"), env);
  }

  if (shouldCapture("ai")) {
    await captureDashboardAi(appPage, path.join(OUT_APP, "ai.png"));
  }

  if (shouldCapture("publish")) {
    await capturePublishModal(appPage, campPageId, path.join(OUT_APP, "publish.png"), env);
  }

  if (shouldCapture("works")) {
    await appPage.goto(`${BASE}/dashboard/pages?client=app`, { waitUntil: "networkidle", timeout: 120_000 });
    await capture(appPage, path.join(OUT_APP, "works.png"), {
      scrollTo: "text=最近のページ",
    });
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
