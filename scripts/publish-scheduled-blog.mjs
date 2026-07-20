import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCHEDULED_DIR = path.join(ROOT, "content", "blog", "scheduled");
const PUBLISH_DIR = path.join(ROOT, "content", "blog");
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

function getTodayJst() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Read date: from frontmatter.
 * Supports standard `---` … `---` blocks and tolerates missing closing `---`.
 * Scans for the first standalone `date: YYYY-MM-DD` line before the closing delimiter;
 * malformed keys like ``## title:`` must not hide a valid `date:` line below — keep YAML `title:` in drafts.
 */
function getFrontmatterDate(markdown) {
  const trimmed = markdown.replace(/^\uFEFF/, "");
  if (!trimmed.startsWith("---")) return null;

  const lines = trimmed.split(/\r?\n/);
  if (lines[0] !== "---") return null;

  for (let i = 1; i < lines.length && i < 120; i++) {
    const line = lines[i];
    if (line === "---") break;
    const m = line.match(/^date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})\s*$/);
    if (m) return m[1];
  }

  return null;
}

function normalizeTargetName(name) {
  return name.replace(/^[0-9]{2}-/, "");
}

function slugFromMarkdownFilename(name) {
  return name.replace(/\.md$/i, "");
}

function getIndexNowKey() {
  const key = process.env.INDEXNOW_KEY?.trim() ?? "";
  return /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : null;
}

function normalizeSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://infomii.com";
  return new URL(raw);
}

/** Best-effort IndexNow ping so new posts are discovered quickly. */
async function submitBlogIndexNow(slugs) {
  const key = getIndexNowKey();
  if (!key || slugs.length === 0) {
    console.log("indexnow_submitted=false");
    return false;
  }

  const site = normalizeSiteUrl();
  const urlList = slugs.map((slug) => new URL(`/blog/${slug}`, site).toString());
  urlList.push(new URL("/blog", site).toString());
  urlList.push(new URL("/blog/rss.xml", site).toString());
  urlList.push(new URL("/sitemap.xml", site).toString());

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: site.host,
        key,
        keyLocation: new URL("/indexnow-key.txt", site).toString(),
        urlList,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    const ok = response.ok || response.status === 202;
    console.log(`indexnow_submitted=${ok}`);
    console.log(`indexnow_status=${response.status}`);
    return ok;
  } catch (error) {
    console.error("indexnow_error", error);
    console.log("indexnow_submitted=false");
    return false;
  }
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
  const publishedSlugs = [];
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
    publishedSlugs.push(slugFromMarkdownFilename(targetName));
  }

  console.log("published=true");
  console.log(`published_count=${published.length}`);
  console.log(`target_paths=${published.join(",")}`);
  await submitBlogIndexNow(publishedSlugs);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
