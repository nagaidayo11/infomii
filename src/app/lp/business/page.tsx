import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ビジネスホテル向け案内ページ作成",
  description: "ビジネスホテル向けに、チェックイン導線・館内案内を最短3分で作成・公開。",
  alternates: {
    canonical: "/lp/business",
  },
  openGraph: {
    title: "ビジネスホテル向け案内ページ作成 | Infomii",
    description: "ビジネスホテル向けに、チェックイン導線・館内案内を最短3分で作成・公開。",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ビジネスホテル向け案内ページ作成 | Infomii",
    description: "ビジネスホテル向けに、チェックイン導線・館内案内を最短3分で作成・公開。",
    images: ["/twitter-image"],
  },
};

export { default } from "../saas/page";
