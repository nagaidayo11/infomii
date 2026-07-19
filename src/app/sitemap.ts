import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import {
  getSupabaseAdminServerClient,
  isSupabaseServiceRoleConfigured,
} from "@/lib/server/supabase-server";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com").replace(/\/$/, "");

/** Re-generate at most hourly so crawlers get fresh guest pages without hitting the DB each time. */
export const revalidate = 3600;

/**
 * Published guest pages. Card-based pages (exist in `pages`) canonicalize to /v,
 * legacy `informations`-only pages to /p — matching the canonical tags we emit.
 */
async function getPublishedGuestPages(): Promise<MetadataRoute.Sitemap> {
  if (!isSupabaseServiceRoleConfigured()) return [];
  try {
    const admin = getSupabaseAdminServerClient();
    const [{ data: publishedRows }, { data: cardPages }] = await Promise.all([
      admin
        .from("informations")
        .select("slug,updated_at")
        .eq("status", "published")
        .limit(10000),
      admin.from("pages").select("slug").limit(10000),
    ]);

    const cardSlugs = new Set(
      (cardPages ?? [])
        .map((r) => (r as { slug?: string | null }).slug)
        .filter((s): s is string => Boolean(s)),
    );

    const seen = new Set<string>();
    const entries: MetadataRoute.Sitemap = [];
    for (const row of publishedRows ?? []) {
      const slug = (row as { slug?: string | null }).slug;
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const updatedAt = (row as { updated_at?: string | null }).updated_at;
      const path = cardSlugs.has(slug) ? `/v/${slug}` : `/p/${slug}`;
      entries.push({
        url: `${appUrl}${path}`,
        lastModified: updatedAt ? new Date(updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    return entries;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = getAllPosts();
  const guestPages = await getPublishedGuestPages();

  return [
    // `/` 308 → /lp/business; keep both so bookmarks and old links resolve in Search Console
    { url: `${appUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${appUrl}/lp/business`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${appUrl}/lp/saas`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${appUrl}/lp/resort`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/lp/spa`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${appUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${appUrl}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T00:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...guestPages,
    { url: `${appUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/commerce`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/refund`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
