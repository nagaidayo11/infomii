import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 公開ゲストページとrewrite入口(/p,/v,/qr,/go)はクロールを許可し、
        // canonicalを読ませる。運用画面とデモだけを除外する。
        disallow: ["/dashboard", "/editor", "/login", "/api", "/demo"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
