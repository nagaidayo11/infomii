import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const posts = getAllPosts();

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
    { url: `${appUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/commerce`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/refund`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
