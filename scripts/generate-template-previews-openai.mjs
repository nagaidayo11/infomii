#!/usr/bin/env node
/**
 * One-shot utility:
 * - Reads public/templates/previews/manifest.json
 * - Generates exterior-focused hotel preview JPGs with OpenAI Images API
 * - Overwrites public/templates/previews/<category>/<slug>.jpg
 *
 * Usage:
 *   node scripts/generate-template-previews-openai.mjs
 *   node scripts/generate-template-previews-openai.mjs --limit=5
 */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "public/templates/previews/manifest.json");
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1152;
const REQUEST_WIDTH = 1536;
const REQUEST_HEIGHT = 1024;

function parseArgs(argv) {
  const out = { limit: null, model: "gpt-image-1", dryRun: false };
  for (const arg of argv) {
    if (arg.startsWith("--limit=")) {
      const v = Number(arg.slice("--limit=".length));
      if (Number.isFinite(v) && v > 0) out.limit = Math.floor(v);
      continue;
    }
    if (arg.startsWith("--model=")) {
      const v = arg.slice("--model=".length).trim();
      if (v) out.model = v;
      continue;
    }
    if (arg === "--dry-run") out.dryRun = true;
  }
  return out;
}

function readEnvFile(absPath) {
  if (!fs.existsSync(absPath)) return {};
  const text = fs.readFileSync(absPath, "utf8");
  const env = {};
  for (const row of text.split(/\r?\n/)) {
    const line = row.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function requireApiKey() {
  const localEnv = readEnvFile(path.join(ROOT, ".env.local"));
  const apiKey = process.env.OPENAI_API_KEY || localEnv.OPENAI_API_KEY || "";
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Set it in .env.local or environment.");
  }
  return apiKey;
}

function loadManifest() {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  const json = JSON.parse(raw);
  if (!Array.isArray(json.entries)) {
    throw new Error("manifest.json entries is not an array");
  }
  return json;
}

function appendSafetyPrompt(basePrompt) {
  const hardRules = [
    "Hard constraints:",
    "Main subject is the hotel stay journey scene, with hotel/building identity kept as a clear anchor.",
    "Do not output a full-elevation facade-only shot. Avoid flat front-view architecture catalog composition.",
    "Foreground must include non-exterior experience cues: approach path, neighborhood context, semi-outdoor transition, or subtle lobby glimpse through glass.",
    "Ensure contextual scene occupies major frame area; architecture identity is anchor, not the only subject.",
    "No food, no drinks, no plated dishes, no restaurant table closeups.",
    "No spa product closeups, no interior dining as main subject.",
    "No readable text, no logos, no watermarks, no brand names.",
    "No close-up portrait faces.",
    "Photorealistic commercial quality. Keep architecture/venue identity clear while preserving contextual storytelling.",
  ].join("\n");
  return `${basePrompt}\n\n${hardRules}`;
}

async function generateOneImage({ apiKey, model, prompt }) {
  const body = {
    model,
    prompt,
    size: `${REQUEST_WIDTH}x${REQUEST_HEIGHT}`,
    quality: "high",
    output_format: "jpeg",
  };

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Images API failed (${response.status}): ${txt}`);
  }

  const json = await response.json();
  const b64 = json?.data?.[0]?.b64_json || json?.data?.[0]?.b64;
  if (!b64 || typeof b64 !== "string") {
    throw new Error("Images API response did not include image bytes");
  }
  return Buffer.from(b64, "base64");
}

function ensureSips() {
  try {
    execFileSync("sips", ["-h"], { stdio: "ignore" });
  } catch {
    throw new Error("sips command is required (macOS image conversion tool).");
  }
}

function convertToTargetJpg(sourceAbs, destAbs) {
  const tempCrop = path.join(os.tmpdir(), `preview-crop-${Date.now()}-${Math.random()}.jpg`);
  const cropHeight = Math.floor((REQUEST_WIDTH * TARGET_HEIGHT) / TARGET_WIDTH);
  try {
    execFileSync("sips", ["-s", "format", "jpeg", sourceAbs, "--out", tempCrop], { stdio: "pipe" });
    execFileSync("sips", ["-c", String(cropHeight), String(REQUEST_WIDTH), tempCrop, "--out", tempCrop], {
      stdio: "pipe",
    });
    execFileSync("sips", ["-z", String(TARGET_HEIGHT), String(TARGET_WIDTH), tempCrop, "--out", destAbs], {
      stdio: "pipe",
    });
  } finally {
    if (fs.existsSync(tempCrop)) fs.unlinkSync(tempCrop);
  }
}

async function withRetry(fn, retries = 3) {
  let lastError = null;
  for (let i = 0; i < retries; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const waitMs = 1000 * (i + 1);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw lastError;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = requireApiKey();
  ensureSips();
  const manifest = loadManifest();
  const entries = args.limit ? manifest.entries.slice(0, args.limit) : manifest.entries;
  if (entries.length === 0) {
    console.log("No entries in manifest.");
    return;
  }

  console.log(`Generating ${entries.length} previews (model=${args.model})`);
  let ok = 0;
  let ng = 0;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const rel = typeof entry.previewPath === "string" ? entry.previewPath : "";
    const prompt = typeof entry.prompt === "string" ? entry.prompt : "";
    if (!rel.startsWith("/templates/previews/")) {
      console.error(`[${i + 1}/${entries.length}] skip invalid previewPath: ${rel}`);
      ng += 1;
      continue;
    }
    if (!prompt.trim()) {
      console.error(`[${i + 1}/${entries.length}] skip empty prompt: ${rel}`);
      ng += 1;
      continue;
    }

    const destAbs = path.join(ROOT, "public", rel);
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    const tmpAbs = path.join(os.tmpdir(), `preview-raw-${Date.now()}-${Math.random()}.jpg`);
    process.stdout.write(`[${i + 1}/${entries.length}] ${rel} ... `);

    try {
      if (args.dryRun) {
        console.log("dry-run");
        ok += 1;
        continue;
      }
      const imageBytes = await withRetry(
        () => generateOneImage({ apiKey, model: args.model, prompt: appendSafetyPrompt(prompt) }),
        3,
      );
      fs.writeFileSync(tmpAbs, imageBytes);
      convertToTargetJpg(tmpAbs, destAbs);
      fs.unlinkSync(tmpAbs);
      console.log("ok");
      ok += 1;
    } catch (err) {
      if (fs.existsSync(tmpAbs)) fs.unlinkSync(tmpAbs);
      console.log("failed");
      console.error(String(err));
      ng += 1;
    }
  }

  console.log(`Done: ok=${ok}, failed=${ng}`);
  if (ng > 0) process.exitCode = 1;
}

await main();
