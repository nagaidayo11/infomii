/**
 * Creates or updates the App Store review demo account (review@infomii.com).
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   APP_STORE_REVIEW_PASSWORD  (required on first create)
 *
 * Usage: npm run app-store:seed-review
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const REVIEW_EMAIL = "review@infomii.com";
const SUPPORT_EMAIL = "support@infomii.com";
const REVIEW_SLUG = "app-store-review";
const REVIEW_PAGE_TITLE = "App Store 審査デモ";

function loadEnvLocal() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing ${name} (set in .env.local)`);
    process.exit(1);
  }
  return value;
}

function buildDefaultHotelName(email) {
  const label = email.split("@")[0]?.trim();
  return label ? `${label} Store` : "My Store";
}

async function findUserByEmail(admin, email) {
  let page = 1;
  const perPage = 200;
  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function ensureHotel(admin, userId, email) {
  const { data: membership } = await admin
    .from("hotel_memberships")
    .select("hotel_id")
    .eq("user_id", userId)
    .maybeSingle();

  let hotelId = membership?.hotel_id ?? null;
  if (!hotelId) {
    hotelId = randomUUID();
    const { error: hotelError } = await admin.from("hotels").insert({
      id: hotelId,
      name: "App Store 審査用",
      owner_user_id: userId,
    });
    if (hotelError) throw new Error(hotelError.message);

    const { error: memberError } = await admin.from("hotel_memberships").insert({
      user_id: userId,
      hotel_id: hotelId,
    });
    if (memberError) throw new Error(memberError.message);
    console.log("Created workspace:", hotelId);
  }

  const { error: ensureError } = await admin.schema("private").rpc("ensure_hotel_subscription", {
    target_hotel_id: hotelId,
  });
  if (ensureError) throw new Error(ensureError.message);

  return hotelId;
}

async function ensurePublishedDemoPage(admin, hotelId) {
  const demoBlocks = [
    {
      id: "review-heading",
      type: "heading",
      text: "App Store 審査デモ",
    },
    {
      id: "review-body",
      type: "paragraph",
      text: "Infomii の公開ページサンプルです。ダッシュボードから編集・公開の流れを確認できます。",
    },
  ];

  const { data: existingInfo } = await admin
    .from("informations")
    .select("id,status")
    .eq("hotel_id", hotelId)
    .eq("slug", REVIEW_SLUG)
    .maybeSingle();

  const now = new Date().toISOString();

  if (existingInfo?.id) {
    const { error } = await admin
      .from("informations")
      .update({
        title: REVIEW_PAGE_TITLE,
        body: "",
        images: [],
        content_blocks: demoBlocks,
        theme: {},
        status: "published",
        publish_at: now,
        unpublish_at: null,
      })
      .eq("id", existingInfo.id);
    if (error) throw new Error(error.message);
    console.log("Updated published information:", REVIEW_SLUG);
  } else {
    const { error } = await admin.from("informations").insert({
      hotel_id: hotelId,
      title: REVIEW_PAGE_TITLE,
      body: "",
      images: [],
      content_blocks: demoBlocks,
      theme: {},
      status: "published",
      publish_at: now,
      unpublish_at: null,
      slug: REVIEW_SLUG,
    });
    if (error) throw new Error(error.message);
    console.log("Created published information:", REVIEW_SLUG);
  }

  const { data: existingPage } = await admin
    .from("pages")
    .select("id")
    .eq("hotel_id", hotelId)
    .eq("slug", REVIEW_SLUG)
    .maybeSingle();

  if (!existingPage?.id) {
    const pageId = randomUUID();
    const { error: pageError } = await admin.from("pages").insert({
      id: pageId,
      hotel_id: hotelId,
      title: REVIEW_PAGE_TITLE,
      slug: REVIEW_SLUG,
    });
    if (pageError) throw new Error(pageError.message);

    const { error: cardError } = await admin.from("cards").insert({
      page_id: pageId,
      type: "hero",
      content: {
        title: "App Store 審査デモ",
        subtitle: "Infomii demo page",
        image: "/hero-block-default-1.png",
      },
      order: 0,
    });
    if (cardError) throw new Error(cardError.message);
    console.log("Created editor page + hero card:", REVIEW_SLUG);
  }
}

async function ensureConfirmedAuthUser(admin, email, displayName, password) {
  let user = await findUserByEmail(admin, email);
  let created = false;

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });
    if (error) throw new Error(error.message);
    user = data.user;
    created = true;
    console.log("Created auth user:", email);
  } else {
    console.log("Auth user already exists:", email);
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    console.log("Password/email_confirm updated for:", email);
  }

  await admin.from("profiles").upsert(
    {
      user_id: user.id,
      display_name: displayName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  await ensureHotel(admin, user.id, email);
  return { user, created };
}

async function main() {
  loadEnvLocal();
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const password = requireEnv("APP_STORE_REVIEW_PASSWORD");

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { created: reviewCreated } = await ensureConfirmedAuthUser(
    admin,
    REVIEW_EMAIL,
    "審査用",
    password,
  );
  await ensureConfirmedAuthUser(admin, SUPPORT_EMAIL, "Infomii Support", password);

  const reviewUser = await findUserByEmail(admin, REVIEW_EMAIL);
  if (!reviewUser) throw new Error("Review user missing after seed");
  const hotelId = await ensureHotel(admin, reviewUser.id, REVIEW_EMAIL);
  await ensurePublishedDemoPage(admin, hotelId);

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://www.infomii.com").replace(
    /\/$/,
    "",
  );

  console.log("\n--- App Store review accounts ---");
  console.log("Review email:", REVIEW_EMAIL);
  console.log("Support email:", SUPPORT_EMAIL);
  console.log("Password: (from APP_STORE_REVIEW_PASSWORD — store in App Store Connect / 1Password)");
  if (reviewCreated) {
    console.log("Note: review account was newly created.");
  }
  console.log("Public URL:", `${appUrl}/p/${REVIEW_SLUG}`);
  console.log("Dashboard: sign in → pages list should include", REVIEW_PAGE_TITLE);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
