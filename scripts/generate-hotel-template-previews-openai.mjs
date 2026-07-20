#!/usr/bin/env node
/**
 * Generates hotel template preview JPEGs from manifest-hotel.json.
 *
 * Usage:
 *   npm run templates:previews:hotel:manifest
 *   npm run templates:previews:hotel:openai
 *   npm run templates:previews:hotel:openai -- --slug=hotel-ryokan-onsen-etiquette
 */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { HOTEL_PREVIEW_ENTRIES } from "./hotel-preview-prompt-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "public/templates/previews/manifest-hotel.json");
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1152;
const REQUEST_WIDTH = 1536;
const REQUEST_HEIGHT = 1024;
const DEFAULT_CANDIDATES = 2;

const VARIANT_GUIDES = [
  "Prioritize experiential context: walkway, steam, lobby threshold, not empty facade.",
  "Asymmetrical composition with clear subject in one third.",
  "Layer foreground, midground, destination anchor for depth.",
  "Golden hour or soft lantern light for warmth.",
  "Include steam, wood texture, or garden path for ryokan/spa themes.",
];

const CATEGORY_JUDGE_HINTS = {
  business: "Urban business hotel context. Reject beach resort or onsen bath scenes.",
  resort: "Resort vacation atmosphere with nature or activities. Reject hair salon or office lobby.",
  ryokan: "Traditional Japanese ryokan or onsen bathhouse. Reject hair salon, beauty parlor, styling chairs.",
  airbnb: "Residential vacation rental. Reject large hotel tower lobby.",
  guide: "Hotel within walkable town/sightseeing context.",
  inbound: "International-friendly hotel arrival. Bright, clear circulation.",
};

function parseArgs(argv) {
  const out = {
    limit: null,
    start: 1,
    slug: null,
    model: "gpt-image-1",
    judgeModel: "gpt-4.1",
    dryRun: false,
    candidates: DEFAULT_CANDIDATES,
    skipJudge: false,
  };
  for (const arg of argv) {
    if (arg.startsWith("--limit=")) {
      const v = Number(arg.slice("--limit=".length));
      if (Number.isFinite(v) && v > 0) out.limit = Math.floor(v);
      continue;
    }
    if (arg.startsWith("--start=")) {
      const v = Number(arg.slice("--start=".length));
      if (Number.isFinite(v) && v >= 1) out.start = Math.floor(v);
      continue;
    }
    if (arg.startsWith("--slug=")) {
      out.slug = arg.slice("--slug=".length).trim() || null;
      continue;
    }
    if (arg.startsWith("--model=")) {
      out.model = arg.slice("--model=".length).trim() || out.model;
      continue;
    }
    if (arg.startsWith("--judge-model=")) {
      out.judgeModel = arg.slice("--judge-model=".length).trim() || out.judgeModel;
      continue;
    }
    if (arg.startsWith("--candidates=")) {
      const v = Number(arg.slice("--candidates=".length));
      if (Number.isFinite(v) && v >= 1 && v <= 6) out.candidates = Math.floor(v);
      continue;
    }
    if (arg === "--dry-run") out.dryRun = true;
    if (arg === "--skip-judge") out.skipJudge = true;
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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function requireApiKey() {
  const localEnv = readEnvFile(path.join(ROOT, ".env.local"));
  const apiKey = process.env.OPENAI_API_KEY || localEnv.OPENAI_API_KEY || "";
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing.");
  return apiKey;
}

function loadEntries() {
  if (fs.existsSync(MANIFEST_PATH)) {
    const json = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    if (Array.isArray(json.entries) && json.entries.length > 0) return json.entries;
  }
  return HOTEL_PREVIEW_ENTRIES.map((e) => ({
    name: e.name,
    slug: e.slug,
    category: e.category,
    previewPath: e.previewPath,
    prompt: e.prompt,
    hint: e.hint,
  }));
}

function buildCandidatePrompt(basePrompt, entry, variantIndex) {
  const guide = VARIANT_GUIDES[variantIndex % VARIANT_GUIDES.length];
  const hint = typeof entry.hint === "string" && entry.hint.trim() ? `Scene hint: ${entry.hint.trim()}` : "";
  return [basePrompt.trim(), hint, `Variation: ${guide}`, `Candidate: ${variantIndex + 1}`].filter(Boolean).join("\n");
}

async function generateOneImage({ apiKey, model, prompt }) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      size: `${REQUEST_WIDTH}x${REQUEST_HEIGHT}`,
      quality: "high",
      output_format: "jpeg",
    }),
  });
  if (!response.ok) throw new Error(`Images API failed (${response.status}): ${await response.text()}`);
  const json = await response.json();
  const b64 = json?.data?.[0]?.b64_json || json?.data?.[0]?.b64;
  if (!b64) throw new Error("No image bytes in response");
  return Buffer.from(b64, "base64");
}

function extractFirstJsonObject(text) {
  const s = text.indexOf("{");
  const e = text.lastIndexOf("}");
  if (s < 0 || e <= s) return null;
  try {
    return JSON.parse(text.slice(s, e + 1));
  } catch {
    return null;
  }
}

function extractResponseText(json) {
  if (typeof json?.output_text === "string" && json.output_text.trim()) return json.output_text;
  const parts = [];
  for (const item of Array.isArray(json?.output) ? json.output : []) {
    for (const c of Array.isArray(item?.content) ? item.content : []) {
      if (typeof c?.text === "string" && c.text.trim()) parts.push(c.text);
    }
  }
  return parts.join("\n");
}

async function scoreCandidateWithVision({ apiKey, judgeModel, entry, imageBytes }) {
  const categoryHint = CATEGORY_JUDGE_HINTS[entry.category] || "";
  const onsenExtra =
    entry.slug?.includes("onsen") || entry.slug?.includes("spa") || entry.name?.includes("温泉")
      ? "Heavy penalty if image looks like hair salon, beauty parlor, or styling station."
      : "";

  const body = {
    model: judgeModel,
    text: {
      format: {
        type: "json_schema",
        name: "hotel_candidate_score",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            theme_score: { type: "number" },
            salon_penalty: { type: "number" },
            text_penalty: { type: "number" },
            category_fit: { type: "number" },
            notes: { type: "string" },
          },
          required: ["theme_score", "salon_penalty", "text_penalty", "category_fit", "notes"],
        },
      },
    },
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              "Score hotel template thumbnail candidate.",
              categoryHint,
              onsenExtra,
              `Template: ${entry.name} (${entry.slug})`,
              "JSON: theme_score 0-10, salon_penalty 0-10, text_penalty 0-10, category_fit 0-10, notes.",
            ].join("\n"),
          },
          { type: "input_image", image_url: `data:image/jpeg;base64,${imageBytes.toString("base64")}` },
        ],
      },
    ],
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Responses API failed (${response.status}): ${await response.text()}`);

  const parsed = extractFirstJsonObject(extractResponseText(await response.json())) || {};
  return {
    themeScore: Number(parsed.theme_score) || 0,
    salonPenalty: Number(parsed.salon_penalty) || 0,
    textPenalty: Number(parsed.text_penalty) || 10,
    categoryFit: Number(parsed.category_fit) || 0,
    notes: typeof parsed.notes === "string" ? parsed.notes : "",
  };
}

function computeFinalScore(s) {
  return s.themeScore * 3 + s.categoryFit * 2 - s.salonPenalty * 4 - s.textPenalty * 3;
}

function ensureSips() {
  try {
    execFileSync("sips", ["-h"], { stdio: "ignore" });
  } catch {
    throw new Error("sips required (macOS).");
  }
}

function convertToTargetJpg(sourceAbs, destAbs) {
  const tempCrop = path.join(os.tmpdir(), `hotel-preview-${Date.now()}.jpg`);
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
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastError;
}

async function generateAndPickCandidate({ apiKey, model, judgeModel, entry, candidates, skipJudge }) {
  const basePrompt = typeof entry.prompt === "string" ? entry.prompt : "";
  const ranked = [];
  for (let i = 0; i < Math.max(1, candidates); i += 1) {
    const imageBytes = await withRetry(
      () => generateOneImage({ apiKey, model, prompt: buildCandidatePrompt(basePrompt, entry, i) }),
      3,
    );
    let score;
    if (skipJudge) {
      score = { themeScore: 5, salonPenalty: 0, textPenalty: 0, categoryFit: 5, notes: "skip-judge" };
    } else {
      try {
        score = await withRetry(() => scoreCandidateWithVision({ apiKey, judgeModel, entry, imageBytes }), 2);
      } catch {
        score = { themeScore: 0, salonPenalty: 10, textPenalty: 10, categoryFit: 0, notes: "judge-failed" };
      }
    }
    ranked.push({ imageBytes, ...score, finalScore: computeFinalScore(score), candidateIndex: i + 1 });
  }
  ranked.sort((a, b) => b.finalScore - a.finalScore);
  return { best: ranked[0], ranked };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let filtered = loadEntries();
  if (args.slug) {
    filtered = filtered.filter((e) => e.slug === args.slug);
    if (filtered.length === 0) throw new Error(`No entry with slug: ${args.slug}`);
  }

  const startIndex = Math.max(0, args.start - 1);
  const entries = (args.limit ? filtered.slice(startIndex, startIndex + args.limit) : filtered.slice(startIndex));
  if (entries.length === 0) {
    console.log("No entries.");
    return;
  }

  if (args.dryRun) {
    entries.forEach((e, i) => console.log(`[${startIndex + i + 1}] ${e.previewPath}`));
    return;
  }

  const apiKey = requireApiKey();
  ensureSips();
  console.log(`Generating ${entries.length} hotel previews (candidates=${args.candidates})`);
  let ok = 0;
  let ng = 0;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const rel = entry.previewPath ?? "";
    process.stdout.write(`[${startIndex + i + 1}/${filtered.length}] ${rel} ... `);
    const destAbs = path.join(ROOT, "public", rel);
    const tmpAbs = path.join(os.tmpdir(), `hotel-raw-${Date.now()}.jpg`);
    try {
      const picked = await generateAndPickCandidate({
        apiKey,
        model: args.model,
        judgeModel: args.judgeModel,
        entry,
        candidates: args.candidates,
        skipJudge: args.skipJudge,
      });
      fs.mkdirSync(path.dirname(destAbs), { recursive: true });
      fs.writeFileSync(tmpAbs, picked.best.imageBytes);
      convertToTargetJpg(tmpAbs, destAbs);
      fs.unlinkSync(tmpAbs);
      console.log(`ok (c${picked.best.candidateIndex} score=${picked.best.finalScore.toFixed(1)})`);
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
