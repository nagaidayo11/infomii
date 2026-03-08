import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${appUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${appUrl}/lp/business`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${appUrl}/lp/resort`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${appUrl}/lp/spa`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${appUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/commerce`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${appUrl}/refund`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
