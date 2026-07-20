import { getAllPosts } from "@/lib/blog";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com").replace(/\/$/, "");

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const posts = getAllPosts();
  const latest = posts[0]?.updated ?? posts[0]?.date ?? "1970-01-01";

  const items = posts
    .map((post) => {
      const link = `${appUrl}/blog/${post.slug}`;
      const pubDate = new Date(`${post.date}T00:00:00.000+09:00`).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Infomii Blog</title>
    <link>${appUrl}/blog</link>
    <description>ホテル運営に役立つQR館内案内の実践記事</description>
    <language>ja</language>
    <lastBuildDate>${new Date(`${latest}T00:00:00.000+09:00`).toUTCString()}</lastBuildDate>
    <atom:link href="${appUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
