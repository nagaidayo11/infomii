#!/usr/bin/env node
/**
 * Generates BtoC template preview JPEGs from manifest-btoc.json (or prompt data module).
 *
 * Usage:
 *   npm run templates:previews:btoc:manifest
 *   npm run templates:previews:btoc:openai
 *   npm run templates:previews:btoc:openai -- --limit=3 --candidates=2
 *   npm run templates:previews:btoc:openai -- --slug=food-kitchen-car-today
 */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { BTOC_PREVIEW_ENTRIES } from "./btoc-preview-prompt-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "public/templates/previews/manifest-btoc.json");
const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1152;
const REQUEST_WIDTH = 1536;
const REQUEST_HEIGHT = 1024;
const DEFAULT_CANDIDATES = 2;

const VARIANT_GUIDES = [
  "Emphasize foreground activity and human-scale cues over empty backgrounds.",
  "Use asymmetrical composition with clear subject in left or right third.",
  "Add environmental depth: midground crowd, signage shapes without readable text.",
  "Favor golden-hour or soft window light for warmth and approachability.",
  "Include subtle motion blur or steam/smoke for lived-in energy.",
];

const CATEGORY_JUDGE_HINTS = {
  travel: "Friends trip, stations, streets, nature, luggage. Reject hotel facade as sole subject.",
  oshi: "Concert, penlights, fan events, café meetups. No identifiable celebrities or readable posters.",
  personal: "Dates, cafés, parties, study groups, home gatherings. Warm and approachable.",
  food: "Kitchen cars, trucks, markets, pickup counters. Appetizing but not greasy macro-only.",
  lightbiz: "Salon, studio, classroom, pop-up shop, small office. Clean friendly B2B, not hotel lobby.",
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
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Set it in .env.local or environment.");
  }
  return apiKey;
}

function loadEntries() {
  if (fs.existsSync(MANIFEST_PATH)) {
    const json = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    if (Array.isArray(json.entries) && json.entries.length > 0) {
      return json.entries;
    }
  }
  return BTOC_PREVIEW_ENTRIES.map((e) => ({
    name: e.name,
    slug: e.slug,
    category: e.category,
    previewPath: e.previewPath,
    prompt: e.prompt,
    hint: e.hint,
  }));
}

function appendBtocSafetyPrompt(basePrompt, entry) {
  const categoryHint = CATEGORY_JUDGE_HINTS[entry.category] || "Experience-forward lifestyle scene.";
  const hardRules = [
    "Hard constraints:",
    "Photorealistic commercial quality, 5:3 horizontal landscape intent.",
    categoryHint,
    "No readable text, no logo, no watermark, no QR code, no app UI screenshot.",
    "Do not make a hotel building exterior the main subject.",
    "Avoid flat centered facade-only composition.",
  ].join("\n");
  return `${basePrompt.trim()}\n\n${hardRules}`;
}

function buildCandidatePrompt(basePrompt, entry, variantIndex) {
  const guide = VARIANT_GUIDES[variantIndex % VARIANT_GUIDES.length];
  const hint = typeof entry.hint === "string" && entry.hint.trim() ? `Scene hint: ${entry.hint.trim()}` : "";
  return [
    appendBtocSafetyPrompt(basePrompt, entry),
    hint,
    `Variation guide: ${guide}`,
    `Candidate index: ${variantIndex + 1}`,
  ]
    .filter(Boolean)
    .join("\n");
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
  if (typeof json?.output_text === "string" && json.output_text.trim()) {
    return json.output_text;
  }
  const out = Array.isArray(json?.output) ? json.output : [];
  const parts = [];
  for (const item of out) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const c of content) {
      if (typeof c?.text === "string" && c.text.trim()) {
        parts.push(c.text);
      }
    }
  }
  return parts.join("\n");
}

async function scoreCandidateWithVision({ apiKey, judgeModel, entry, imageBytes }) {
  const b64 = imageBytes.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${b64}`;
  const categoryHint = CATEGORY_JUDGE_HINTS[entry.category] || "";
  const rubric = [
    "You are selecting a BtoC template marketplace thumbnail.",
    categoryHint,
    "Return strict JSON with keys:",
    "- scene_score: number 0-10 (clear theme, engaging composition)",
    "- text_penalty: number 0-10 (readable text/logos/watermarks)",
    "- hotel_penalty: number 0-10 (hotel exterior dominates)",
    "- category_fit: number 0-10",
    "- notes: short string",
  ].join("\n");

  const body = {
    model: judgeModel,
    text: {
      format: {
        type: "json_schema",
        name: "btoc_candidate_score",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            scene_score: { type: "number" },
            text_penalty: { type: "number" },
            hotel_penalty: { type: "number" },
            category_fit: { type: "number" },
            notes: { type: "string" },
          },
          required: ["scene_score", "text_penalty", "hotel_penalty", "category_fit", "notes"],
        },
      },
    },
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `${rubric}\nCategory: ${entry.category}\nTemplate: ${entry.name}`,
          },
          { type: "input_image", image_url: dataUrl },
        ],
      },
    ],
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Responses API failed (${response.status}): ${txt}`);
  }

  const json = await response.json();
  const text = extractResponseText(json);
  const parsed = extractFirstJsonObject(text) || {};

  const sceneScore = Number(parsed.scene_score);
  const textPenalty = Number(parsed.text_penalty);
  const hotelPenalty = Number(parsed.hotel_penalty);
  const categoryFit = Number(parsed.category_fit);

  return {
    sceneScore: Number.isFinite(sceneScore) ? sceneScore : 0,
    textPenalty: Number.isFinite(textPenalty) ? textPenalty : 10,
    hotelPenalty: Number.isFinite(hotelPenalty) ? hotelPenalty : 0,
    categoryFit: Number.isFinite(categoryFit) ? categoryFit : 0,
    notes: typeof parsed.notes === "string" ? parsed.notes : "",
  };
}

function computeFinalScore(s) {
  return s.sceneScore * 3 + s.categoryFit * 2 - s.textPenalty * 4 - s.hotelPenalty * 3;
}

function ensureSips() {
  try {
    execFileSync("sips", ["-h"], { stdio: "ignore" });
  } catch {
    throw new Error("sips command is required (macOS image conversion tool).");
  }
}

function convertToTargetJpg(sourceAbs, destAbs) {
  const tempCrop = path.join(os.tmpdir(), `btoc-preview-crop-${Date.now()}-${Math.random()}.jpg`);
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
  const tries = Math.max(1, candidates);
  const ranked = [];

  for (let i = 0; i < tries; i += 1) {
    const prompt = buildCandidatePrompt(basePrompt, entry, i);
    const imageBytes = await withRetry(() => generateOneImage({ apiKey, model, prompt }), 3);
    let score;
    if (skipJudge) {
      score = { sceneScore: 5, textPenalty: 0, hotelPenalty: 0, categoryFit: 5, notes: "skip-judge" };
    } else {
      try {
        score = await withRetry(
          () => scoreCandidateWithVision({ apiKey, judgeModel, entry, imageBytes }),
          2,
        );
      } catch {
        score = { sceneScore: 0, textPenalty: 10, hotelPenalty: 5, categoryFit: 0, notes: "vision-score-failed" };
      }
    }

    ranked.push({
      imageBytes,
      ...score,
      finalScore: computeFinalScore(score),
      candidateIndex: i + 1,
    });
  }

  ranked.sort((a, b) => b.finalScore - a.finalScore);
  return { best: ranked[0], ranked };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const allEntries = loadEntries();
  let filtered = allEntries;
  if (args.slug) {
    filtered = allEntries.filter((e) => e.slug === args.slug);
    if (filtered.length === 0) {
      throw new Error(`No entry with slug: ${args.slug}`);
    }
  }

  const startIndex = Math.max(0, args.start - 1);
  const baseEntries = filtered.slice(startIndex);
  const entries = args.limit ? baseEntries.slice(0, args.limit) : baseEntries;
  if (entries.length === 0) {
    console.log("No entries to generate.");
    return;
  }

  if (args.dryRun) {
    for (let i = 0; i < entries.length; i += 1) {
      const e = entries[i];
      console.log(`[${startIndex + i + 1}] ${e.previewPath} (${e.category}/${e.slug})`);
    }
    console.log(`Dry-run: ${entries.length} entries`);
    return;
  }

  const apiKey = requireApiKey();
  ensureSips();

  console.log(
    `Generating ${entries.length} BtoC previews (model=${args.model}, judge=${args.judgeModel}, candidates=${args.candidates})`,
  );
  let ok = 0;
  let ng = 0;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const displayIndex = startIndex + i + 1;
    const rel = typeof entry.previewPath === "string" ? entry.previewPath : "";
    const prompt = typeof entry.prompt === "string" ? entry.prompt : "";
    if (!rel.startsWith("/templates/previews/")) {
      console.error(`[${displayIndex}] skip invalid previewPath: ${rel}`);
      ng += 1;
      continue;
    }
    if (!prompt.trim()) {
      console.error(`[${displayIndex}] skip empty prompt: ${rel}`);
      ng += 1;
      continue;
    }

    const destAbs = path.join(ROOT, "public", rel);
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    const tmpAbs = path.join(os.tmpdir(), `btoc-preview-raw-${Date.now()}-${Math.random()}.jpg`);
    process.stdout.write(`[${displayIndex}/${filtered.length}] ${rel} ... `);

    try {
      const picked = await generateAndPickCandidate({
        apiKey,
        model: args.model,
        judgeModel: args.judgeModel,
        entry,
        candidates: args.candidates,
        skipJudge: args.skipJudge,
      });

      fs.writeFileSync(tmpAbs, picked.best.imageBytes);
      convertToTargetJpg(tmpAbs, destAbs);
      fs.unlinkSync(tmpAbs);

      console.log(
        `ok (c${picked.best.candidateIndex} score=${picked.best.finalScore.toFixed(1)} scene=${picked.best.sceneScore} textPen=${picked.best.textPenalty})`,
      );
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
