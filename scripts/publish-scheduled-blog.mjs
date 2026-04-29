import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCHEDULED_DIR = path.join(ROOT, "content", "blog", "scheduled");
const PUBLISH_DIR = path.join(ROOT, "content", "blog");

function getTodayJst() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getFrontmatterDate(markdown) {
  const m = markdown.match(/^---\n[\s\S]*?\n---/);
  if (!m) return null;
  const dateLine = m[0].match(/^date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*$/m);
  return dateLine?.[1] ?? null;
}

function normalizeTargetName(name) {
  return name.replace(/^[0-9]{2}-/, "");
}

async function main() {
  const today = getTodayJst();
  let entries = [];
  try {
    entries = await fs.readdir(SCHEDULED_DIR, { withFileTypes: true });
  } catch {
    console.log("published=false");
    return;
  }

  const candidates = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const full = path.join(SCHEDULED_DIR, entry.name);
    const content = await fs.readFile(full, "utf8");
    const date = getFrontmatterDate(content);
    if (!date) continue;
    if (date <= today) {
      candidates.push({ full, name: entry.name, date });
    }
  }

  if (candidates.length === 0) {
    console.log("published=false");
    return;
  }

  candidates.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.name.localeCompare(b.name);
  });

  const published = [];
  for (const chosen of candidates) {
    const targetName = normalizeTargetName(chosen.name);
    const targetPath = path.join(PUBLISH_DIR, targetName);

    try {
      await fs.access(targetPath);
      throw new Error(`Target already exists: ${targetName}`);
    } catch (error) {
      if (error && error.code !== "ENOENT") {
        throw error;
      }
    }

    await fs.rename(chosen.full, targetPath);
    const rel = path.relative(ROOT, targetPath).replaceAll(path.sep, "/");
    published.push(rel);
  }

  console.log("published=true");
  console.log(`published_count=${published.length}`);
  console.log(`target_paths=${published.join(",")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

