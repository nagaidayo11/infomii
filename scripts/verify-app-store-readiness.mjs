/**
 * Quick checks before iOS App Store submission.
 * Usage: npm run app-store:verify
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

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

function ok(msg) {
  console.log(`✓ ${msg}`);
}

function fail(msg) {
  console.error(`✗ ${msg}`);
}

async function checkAasa(baseUrl) {
  const url = `${baseUrl.replace(/\/$/, "")}/.well-known/apple-app-site-association`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await res.text();
    if (!res.ok) {
      fail(`AASA ${url} → HTTP ${res.status}`);
      return false;
    }
    const json = JSON.parse(text);
    const appId = json?.applinks?.details?.[0]?.appID;
    if (!appId || String(appId).includes("REPLACE")) {
      fail(`AASA missing valid appID at ${url}`);
      return false;
    }
    ok(`AASA OK (${appId})`);
    return true;
  } catch (e) {
    fail(`AASA fetch failed: ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

async function main() {
  loadEnvLocal();
  let errors = 0;

  const teamId = process.env.APPLE_TEAM_ID?.trim();
  if (!teamId || teamId.includes("REPLACE")) {
    fail("APPLE_TEAM_ID is not set in .env.local / Vercel");
    errors += 1;
  } else {
    ok(`APPLE_TEAM_ID=${teamId}`);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    fail("NEXT_PUBLIC_SUPABASE_URL missing");
    errors += 1;
  } else {
    ok("Supabase URL configured");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    fail("SUPABASE_SERVICE_ROLE_KEY missing (needed for seed script)");
    errors += 1;
  } else {
    ok("Supabase service role configured");
  }

  const mobilePkg = join(ROOT, "apps/mobile/package.json");
  if (!existsSync(mobilePkg)) {
    fail("apps/mobile/package.json not found");
    errors += 1;
  } else {
    const pkg = JSON.parse(readFileSync(mobilePkg, "utf8"));
    if (!pkg.dependencies?.["expo-notifications"]) {
      fail("expo-notifications not in apps/mobile dependencies");
      errors += 1;
    } else {
      ok("expo-notifications in mobile package.json");
    }
  }

  const aasaRoute = join(ROOT, "src/app/.well-known/apple-app-site-association/route.ts");
  if (!existsSync(aasaRoute)) {
    fail("Dynamic AASA route missing");
    errors += 1;
  } else {
    ok("Dynamic AASA route present");
  }

  const base =
    process.env.APP_STORE_VERIFY_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "https://www.infomii.com";

  if (process.argv.includes("--skip-remote")) {
    console.log("(skipped remote AASA check; pass without --skip-remote to probe production)");
  } else {
    const aasaOk = await checkAasa(base);
    if (!aasaOk) errors += 1;
  }

  console.log(errors === 0 ? "\nAll checks passed." : `\n${errors} check(s) failed.`);
  process.exit(errors === 0 ? 0 : 1);
}

main();
