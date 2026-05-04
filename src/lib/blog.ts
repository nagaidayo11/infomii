import fs from "node:fs";
import path from "node:path";

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
  contentHtml: string;
};

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

function renderMarkdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const out: string[] = [];
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
      const level = heading[1].length;
      const text = parseInlineMarkdown(heading[2].trim());
      const cls =
        level === 1
          ? "mt-8 text-2xl font-bold tracking-tight text-slate-900"
          : level === 2
            ? "mt-8 text-xl font-semibold text-slate-900"
            : "mt-6 text-lg font-semibold text-slate-900";
      out.push(`<h${level} class="${cls}">${text}</h${level}>`);
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

  return out.join("\n");
}

function readMarkdownFile(filePath: string): BlogPost {
  const raw = fs.readFileSync(filePath, "utf8");
  const { frontmatter, body } = parseFrontmatter(raw);
  const slug = path.basename(filePath, ".md");

  const title = frontmatter.title ?? slug;
  const date = frontmatter.date ?? "1970-01-01";
  const description = frontmatter.description ?? "";

  return {
    slug,
    title,
    date,
    description,
    content: body,
    contentHtml: renderMarkdownToHtml(body),
  };
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((name) => name.endsWith(".md"));
  return files
    .map((file) => readMarkdownFile(path.join(BLOG_DIR, file)))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ slug, title, date, description }) => ({ slug, title, date, description }));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return readMarkdownFile(filePath);
}

