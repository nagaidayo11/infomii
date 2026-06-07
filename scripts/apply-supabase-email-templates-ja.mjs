/**
 * Apply Japanese Auth email templates to a hosted Supabase project.
 *
 * Requires:
 *   SUPABASE_ACCESS_TOKEN  — https://supabase.com/dashboard/account/tokens
 *   NEXT_PUBLIC_SUPABASE_URL — e.g. https://xxxx.supabase.co
 *
 * Usage:
 *   npm run supabase:email-templates-ja
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { SUPABASE_EMAIL_TEMPLATES_JA } from "./supabase-email-templates-ja.mjs";

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

function projectRefFromUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

async function main() {
  loadEnvLocal();

  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!token) {
    console.error("Missing SUPABASE_ACCESS_TOKEN.");
    console.error("Create one at https://supabase.com/dashboard/account/tokens");
    process.exit(1);
  }
  if (!supabaseUrl) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
    process.exit(1);
  }

  const projectRef = projectRefFromUrl(supabaseUrl);
  if (!projectRef) {
    console.error("Could not parse project ref from NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(SUPABASE_EMAIL_TEMPLATES_JA),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed (${res.status}):`, text);
    process.exit(1);
  }

  console.log("Applied Japanese email templates to project:", projectRef);
  console.log("- Confirm signup");
  console.log("- Reset password");
  console.log("- Magic link");
  console.log("- Invite user");
  console.log("- Change email");
  console.log("- Reauthentication OTP");
  console.log("\nSend a test signup to verify the new copy.");
  console.log("Sender name remains Supabase default until custom SMTP is configured.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
