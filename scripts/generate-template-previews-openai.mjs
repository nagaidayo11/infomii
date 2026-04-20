#!/usr/bin/env node
/**
 * One-shot utility:
 * - Reads public/templates/previews/manifest.json
 * - Generates multiple candidates per entry with OpenAI Images API
 * - Uses vision scoring to reject exterior-only candidates
 * - Overwrites public/templates/previews/<category>/<slug>.jpg
 *
 * Usage:
 *   node scripts/generate-template-previews-openai.mjs
 *   node scripts/generate-template-previews-openai.mjs --limit=5 --candidates=4
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
const DEFAULT_CANDIDATES = 4;

const VARIANT_GUIDES = [
  "Prioritize foreground journey cues: walkway, curbside drop-off, threshold transition.",
  "Prioritize semi-outdoor transition: canopy, entrance edge, visible depth layers.",
  "Prioritize neighborhood context and movement lines guiding toward the property.",
  "Prioritize through-glass glimpse of lobby/activity while keeping exterior identity anchor.",
  "Prioritize asymmetrical storytelling composition, avoid centered facade dominance.",
  "Prioritize experiential framing with layered foreground, midground, and destination anchor.",
];

function parseArgs(argv) {
  const out = {
    limit: null,
    start: 1,
    model: "gpt-image-1",
    judgeModel: "gpt-4.1",
    dryRun: false,
    candidates: DEFAULT_CANDIDATES,
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
    if (arg.startsWith("--model=")) {
      const v = arg.slice("--model=".length).trim();
      if (v) out.model = v;
      continue;
    }
    if (arg.startsWith("--judge-model=")) {
      const v = arg.slice("--judge-model=".length).trim();
      if (v) out.judgeModel = v;
      continue;
    }
    if (arg.startsWith("--candidates=")) {
      const v = Number(arg.slice("--candidates=".length));
      if (Number.isFinite(v) && v >= 1 && v <= 8) out.candidates = Math.floor(v);
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
    "Make this an experience-forward hospitality scene, not just a building exterior photo.",
    "Property identity should stay visible as an anchor, but the frame should emphasize journey/context cues.",
    "Avoid flat centered full-facade composition.",
    "No readable text, no logo, no watermark, no brand names.",
    "Photorealistic commercial quality.",
  ].join("\n");
  return `${basePrompt}\n\n${hardRules}`;
}

function buildCandidatePrompt(basePrompt, entry, variantIndex) {
  const guide = VARIANT_GUIDES[variantIndex % VARIANT_GUIDES.length];
  return [
    appendSafetyPrompt(basePrompt),
    `Candidate objective: maximize experiential context for category '${entry.category}'.`,
    `Variation guide: ${guide}`,
    `Candidate index: ${variantIndex + 1}`,
  ].join("\n");
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
  const rubric = [
    "You are selecting a template thumbnail candidate.",
    "Goal: reject exterior-only facade shots and prefer experience-forward scenes.",
    "Return strict JSON with keys:",
    "- context_score: number 0-10 (higher = richer non-facade context/journey)",
    "- exterior_only_penalty: number 0-10 (higher = facade-only bias)",
    "- category_fit: number 0-10",
    "- notes: short string",
  ].join("\n");

  const body = {
    model: judgeModel,
    text: {
      format: {
        type: "json_schema",
        name: "candidate_score",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            context_score: { type: "number" },
            exterior_only_penalty: { type: "number" },
            category_fit: { type: "number" },
            notes: { type: "string" },
          },
          required: ["context_score", "exterior_only_penalty", "category_fit", "notes"],
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
          {
            type: "input_image",
            image_url: dataUrl,
          },
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

  const contextScore = Number(parsed.context_score);
  const exteriorPenalty = Number(parsed.exterior_only_penalty);
  const categoryFit = Number(parsed.category_fit);

  return {
    contextScore: Number.isFinite(contextScore) ? contextScore : 0,
    exteriorPenalty: Number.isFinite(exteriorPenalty) ? exteriorPenalty : 10,
    categoryFit: Number.isFinite(categoryFit) ? categoryFit : 0,
    notes: typeof parsed.notes === "string" ? parsed.notes : "",
  };
}

function computeFinalScore(s) {
  return s.contextScore * 3 + s.categoryFit * 2 - s.exteriorPenalty * 3;
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

async function generateAndPickCandidate({ apiKey, model, judgeModel, entry, candidates }) {
  const basePrompt = typeof entry.prompt === "string" ? entry.prompt : "";
  const tries = Math.max(1, candidates);
  const ranked = [];

  for (let i = 0; i < tries; i += 1) {
    const prompt = buildCandidatePrompt(basePrompt, entry, i);
    const imageBytes = await withRetry(() => generateOneImage({ apiKey, model, prompt }), 3);
    let score;
    try {
      score = await withRetry(() => scoreCandidateWithVision({ apiKey, judgeModel, entry, imageBytes }), 2);
    } catch {
      score = { contextScore: 0, exteriorPenalty: 10, categoryFit: 0, notes: "vision-score-failed" };
    }

    ranked.push({
      imageBytes,
      ...score,
      finalScore: computeFinalScore(score),
      candidateIndex: i + 1,
    });
  }

  ranked.sort((a, b) => b.finalScore - a.finalScore);
  return {
    best: ranked[0],
    ranked,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const apiKey = requireApiKey();
  ensureSips();
  const manifest = loadManifest();
  const startIndex = Math.max(0, args.start - 1);
  const baseEntries = manifest.entries.slice(startIndex);
  const entries = args.limit ? baseEntries.slice(0, args.limit) : baseEntries;
  if (entries.length === 0) {
    console.log("No entries in manifest.");
    return;
  }

  console.log(
    `Generating ${entries.length} previews (model=${args.model}, judge=${args.judgeModel}, candidates=${args.candidates})`,
  );
  let ok = 0;
  let ng = 0;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const displayIndex = startIndex + i + 1;
    const rel = typeof entry.previewPath === "string" ? entry.previewPath : "";
    const prompt = typeof entry.prompt === "string" ? entry.prompt : "";
    if (!rel.startsWith("/templates/previews/")) {
      console.error(`[${displayIndex}/${manifest.entries.length}] skip invalid previewPath: ${rel}`);
      ng += 1;
      continue;
    }
    if (!prompt.trim()) {
      console.error(`[${displayIndex}/${manifest.entries.length}] skip empty prompt: ${rel}`);
      ng += 1;
      continue;
    }

    const destAbs = path.join(ROOT, "public", rel);
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    const tmpAbs = path.join(os.tmpdir(), `preview-raw-${Date.now()}-${Math.random()}.jpg`);
    process.stdout.write(`[${displayIndex}/${manifest.entries.length}] ${rel} ... `);

    try {
      if (args.dryRun) {
        console.log("dry-run");
        ok += 1;
        continue;
      }

      const picked = await generateAndPickCandidate({
        apiKey,
        model: args.model,
        judgeModel: args.judgeModel,
        entry,
        candidates: args.candidates,
      });

      fs.writeFileSync(tmpAbs, picked.best.imageBytes);
      convertToTargetJpg(tmpAbs, destAbs);
      fs.unlinkSync(tmpAbs);

      console.log(
        `ok (pick c${picked.best.candidateIndex} score=${picked.best.finalScore.toFixed(1)} ctx=${picked.best.contextScore} pen=${picked.best.exteriorPenalty})`,
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
