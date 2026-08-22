import fs from "node:fs";
import path from "node:path";

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  description: string;
};

export type BlogHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type BlogFaqItem = {
  q: string;
  a: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
  contentHtml: string;
  headings: BlogHeading[];
  faq: BlogFaqItem[];
};

/** High-intent hub posts shown first on /blog. Keep in sync with live slugs. */
export const BLOG_PILLAR_SLUGS = [
  "how-to-create-hotel-guide",
  "hotel-qr-guide",
  "hotel-information-smartphone",
  "hotel-dx-getting-started",
  "hotel-guide-app-vs-qr-web",
  "infomii-features-overview",
] as const;

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } {
  if (!raw.startsWith("---")) {
    return { frontmatter: {}, body: raw };
  }

  const lines = raw.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") {
    return { frontmatter: {}, body: raw };
  }

  let idx = 1;
  const frontmatter: Record<string, string> = {};
  while (idx < lines.length) {
    const line = lines[idx];
    if (line.trim() === "---") {
      idx += 1;
      return { frontmatter, body: lines.slice(idx).join("\n").trim() };
    }
    const brokenTitle = line.match(/^##\s*title:\s*(.+)$/);
    if (brokenTitle) {
      frontmatter.title = brokenTitle[1].trim();
      idx += 1;
      continue;
    }
    const sep = line.indexOf(":");
    if (sep > 0) {
      const key = line.slice(0, sep).trim();
      const value = line.slice(sep + 1).trim();
      if (key && !key.startsWith("#")) {
        frontmatter[key] = value;
      }
    }
    idx += 1;
  }

  // No closing `---` before EOF (common accident): keep title/date/description and treat the rest as body.
  let bodyStart = lines.length;
  for (let i = 1; i < lines.length; i++) {
    if (/^description:\s*/.test(lines[i])) {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      if (j >= lines.length) {
        bodyStart = lines.length;
      } else if (lines[j].trim() === "---") {
        j += 1;
        while (j < lines.length && lines[j].trim() === "") j++;
        bodyStart = j;
      } else {
        bodyStart = j;
      }
      break;
    }
  }

  return { frontmatter, body: lines.slice(bodyStart).join("\n").trim() };
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseInlineMarkdown(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-700 underline underline-offset-2 hover:text-emerald-800">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-[0.92em]">$1</code>');
}

function plainMarkdownText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function headingIdFromText(text: string, used: Set<string>): string {
  const plain = plainMarkdownText(text);
  let base = Array.from(plain)
    .filter((ch) => /[\p{L}\p{N}\-ー]/u.test(ch) || ch === " " || ch === "／")
    .join("")
    .replace(/\s+/g, "-")
    .replace(/／/g, "-")
    .slice(0, 60);
  if (!base) base = "section";
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

const TOC_SKIP_HEADINGS = /^(内部リンク候補|内部リンク|⑤ CTA)/;

function extractFaqFromMarkdown(markdown: string): BlogFaqItem[] {
  const lines = markdown.split(/\r?\n/);
  const items: BlogFaqItem[] = [];
  let inFaq = false;
  let current: { q: string; aLines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const a = current.aLines
      .map((line) =>
        plainMarkdownText(line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "")),
      )
      .filter(Boolean)
      .join(" ")
      .trim();
    if (current.q && a) items.push({ q: current.q, a });
    current = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      if (/よくある質問/.test(h2[1])) {
        inFaq = true;
        flush();
        continue;
      }
      if (inFaq) break;
    }
    if (!inFaq) continue;
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      flush();
      current = { q: plainMarkdownText(h3[1]), aLines: [] };
      continue;
    }
    if (current && line && !line.startsWith("|")) {
      current.aLines.push(line);
    }
  }
  flush();
  return items;
}

function renderMarkdownToHtml(markdown: string): { html: string; headings: BlogHeading[] } {
  const lines = markdown.split(/\r?\n/);
  const out: string[] = [];
  const headings: BlogHeading[] = [];
  const usedIds = new Set<string>();
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length as 1 | 2 | 3;
      const rawText = heading[2].trim();
      const text = parseInlineMarkdown(rawText);
      const id = headingIdFromText(rawText, usedIds);
      const cls =
        level === 1
          ? "mt-8 scroll-mt-24 text-2xl font-bold tracking-tight text-slate-900"
          : level === 2
            ? "mt-8 scroll-mt-24 text-xl font-semibold text-slate-900"
            : "mt-6 scroll-mt-24 text-lg font-semibold text-slate-900";
      out.push(`<h${level} id="${escapeHtml(id)}" class="${cls}">${text}</h${level}>`);
      if ((level === 2 || level === 3) && !TOC_SKIP_HEADINGS.test(plainMarkdownText(rawText))) {
        headings.push({ id, text: plainMarkdownText(rawText), level });
      }
      i += 1;
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      if (tableLines.length >= 2) {
        const rows = tableLines
          .map((row) => row.split("|").slice(1, -1).map((cell) => parseInlineMarkdown(cell.trim())))
          .filter((cells) => cells.length > 0);
        const [header, ...bodyRows] = rows;
        out.push('<div class="my-6 overflow-x-auto rounded-xl border border-slate-200">');
        out.push('<table class="min-w-full border-collapse text-sm">');
        out.push('<thead class="bg-slate-50"><tr>');
        for (const cell of header) out.push(`<th class="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">${cell}</th>`);
        out.push("</tr></thead><tbody>");
        for (const row of bodyRows) {
          out.push('<tr class="odd:bg-white even:bg-slate-50/40">');
          for (const cell of row) out.push(`<td class="border-t border-slate-100 px-3 py-2 align-top text-slate-700">${cell}</td>`);
          out.push("</tr>");
        }
        out.push("</tbody></table></div>");
      }
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i += 1;
      }
      out.push('<ul class="my-4 list-disc space-y-2 pl-6 text-slate-700">');
      for (const item of items) out.push(`<li>${parseInlineMarkdown(item)}</li>`);
      out.push("</ul>");
      continue;
    }

    const ordered = line.match(/^\d+\.\s+/);
    if (ordered) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      out.push('<ol class="my-4 list-decimal space-y-2 pl-6 text-slate-700">');
      for (const item of items) out.push(`<li>${parseInlineMarkdown(item)}</li>`);
      out.push("</ol>");
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith("#") && !lines[i].trim().startsWith("- ") && !lines[i].trim().startsWith("|")) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    out.push(`<p class="mt-4 leading-8 text-slate-700">${parseInlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return { html: out.join("\n"), headings };
}

function readMarkdownFile(filePath: string): BlogPost {
  const raw = fs.readFileSync(filePath, "utf8");
  const { frontmatter, body } = parseFrontmatter(raw);
  const slug = path.basename(filePath, ".md");
  const rendered = renderMarkdownToHtml(body);

  const title = frontmatter.title ?? slug;
  const date = frontmatter.date ?? "1970-01-01";
  const updated = frontmatter.updated || undefined;
  const description = frontmatter.description ?? "";

  return {
    slug,
    title,
    date,
    ...(updated ? { updated } : {}),
    description,
    content: body,
    contentHtml: rendered.html,
    headings: rendered.headings,
    faq: extractFaqFromMarkdown(body),
  };
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((name) => name.endsWith(".md"));
  return files
    .map((file) => readMarkdownFile(path.join(BLOG_DIR, file)))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ slug, title, date, updated, description }) => ({
      slug,
      title,
      date,
      ...(updated ? { updated } : {}),
      description,
    }));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return readMarkdownFile(filePath);
}

export type BlogCategory = {
  id: string;
  label: string;
  description: string;
  /**
   * Hyphen-bounded slug tokens/phrases. Matching uses token boundaries, not
   * raw substring includes (so `event` does not match `prevention`).
   */
  match: string[];
};

/**
 * ブログのトピッククラスター。フロントマターを触らず slug から自動分類し、
 * ハブページ・関連記事・内部リンクの土台にする。
 */
export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: "getting-started",
    label: "はじめかた・作り方",
    description: "案内ページの作成手順やテンプレ活用の基本。",
    match: [
      "how-to",
      "creation",
      "setup",
      "template",
      "block-editor",
      "guide-page-build",
      "first-guide",
      "features-overview",
      "pricing",
      "canva",
      "notion",
      "google-sites",
      "dx",
      "writing",
      "clear-writing",
      "content-items",
      "mobile-ux",
    ],
  },
  {
    id: "qr",
    label: "QR・ペーパーレス",
    description: "紙からの移行、QR設置、ペーパーレス運用のノウハウ。",
    match: [
      "qr",
      "paper",
      "paperless",
      "pdf",
      "signage",
      "migration",
      "landing",
      "smartphone",
      "information-smartphone",
      "line",
      "tablet",
    ],
  },
  {
    id: "checkin",
    label: "チェックイン/アウト",
    description: "チェックイン・チェックアウト前後の案内改善。",
    match: ["checkin", "checkout", "congestion", "self-checkin"],
  },
  {
    id: "inbound",
    label: "インバウンド・多言語",
    description: "訪日客対応と多言語案内のノウハウ。",
    match: ["inbound", "multilingual", "bilingual", "multi-property"],
  },
  {
    id: "operations",
    label: "運用・チーム",
    description: "更新統制・引き継ぎ・シフト運用など現場オペレーション。",
    match: [
      "ops",
      "operation",
      "governance",
      "staff",
      "team",
      "handoff",
      "night",
      "understaffed",
      "overnight",
      "rollforward",
      "month-end",
      "weekly-review",
      "kpi",
      "audit",
      "drift",
      "safe-live",
      "collaboration",
      "housekeeping",
      "adoption",
      "training",
      "efficiency",
      "ongoing",
      "seasonal",
      "emergency",
    ],
  },
  {
    id: "cx",
    label: "満足度・リピート",
    description: "ゲスト満足度・口コミ・問い合わせ削減・リピート施策。",
    match: [
      "satisfaction",
      "review-score",
      "repeat",
      "loyalty",
      "complaint",
      "inquiry",
      "guardrail",
      "messaging",
    ],
  },
  {
    id: "by-facility",
    label: "施設タイプ別",
    description: "ホテル・旅館・民泊など施設タイプ別の設計と季節運用。",
    match: [
      "ryokan",
      "onsen",
      "minpaku",
      "boutique",
      "business-hotel",
      "city-hotel",
      "resort",
      "unmanned",
      "large-bath",
      "restaurant",
      "floor-map",
      "family",
      "fireworks",
      "fireworks-event",
      "typhoon",
      "obon",
      "summer",
      "happy-hour",
      "ancillary",
      "scenario",
      "property",
      "breakfast",
      "chatbot",
      "outsourcing",
      "tools",
    ],
  },
];

/** Match a category keyword against hyphen-bounded slug tokens. */
function slugMatchesKeyword(slug: string, keyword: string): boolean {
  const needle = keyword.toLowerCase();
  const hay = slug.toLowerCase();
  if (needle.includes("-")) {
    return (
      hay === needle ||
      hay.startsWith(`${needle}-`) ||
      hay.endsWith(`-${needle}`) ||
      hay.includes(`-${needle}-`)
    );
  }
  return hay.split("-").includes(needle);
}

/** slug から該当カテゴリ ID を返す（無ければ空配列）。 */
export function getPostCategoryIds(slug: string): string[] {
  return BLOG_CATEGORIES.filter((c) => c.match.some((m) => slugMatchesKeyword(slug, m))).map(
    (c) => c.id,
  );
}

export function getCategory(id: string): BlogCategory | null {
  return BLOG_CATEGORIES.find((c) => c.id === id) ?? null;
}

export function getPostCategories(slug: string): BlogCategory[] {
  return getPostCategoryIds(slug)
    .map((id) => getCategory(id))
    .filter((c): c is BlogCategory => Boolean(c));
}

export function getPostsByCategory(categoryId: string): BlogPostMeta[] {
  return getAllPosts().filter((post) => getPostCategoryIds(post.slug).includes(categoryId));
}

function slugTokens(slug: string): string[] {
  return slug.split("-").filter((token) => token.length > 2);
}

/** カテゴリ一致 + slug トークン重複でスコア付けした関連記事。弱関連は出さない。 */
export function getRelatedPosts(slug: string, limit = 4): BlogPostMeta[] {
  const all = getAllPosts();
  const currentCategories = new Set(getPostCategoryIds(slug));
  const currentTokens = new Set(slugTokens(slug));

  return all
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const categoryScore =
        getPostCategoryIds(post.slug).filter((id) => currentCategories.has(id)).length * 3;
      const tokenScore = slugTokens(post.slug).filter((token) => currentTokens.has(token)).length;
      return { post, score: categoryScore + tokenScore };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit)
    .map((entry) => entry.post);
}

export function getPillarPosts(): BlogPostMeta[] {
  const bySlug = new Map(getAllPosts().map((post) => [post.slug, post]));
  return BLOG_PILLAR_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (post): post is BlogPostMeta => Boolean(post),
  );
}

