import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 公開ゲストページ(/p,/v)はインデックス許可。運用画面・デモ・rewrite重複元は除外。
        disallow: ["/dashboard", "/editor", "/login", "/api", "/demo", "/qr", "/go"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
