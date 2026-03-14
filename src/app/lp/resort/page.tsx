import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "リゾートホテル向け案内ページ作成",
  description: "リゾートホテル向けに、滞在導線・体験予約導線を最短3分で作成・公開。",
  alternates: {
    canonical: "/lp/resort",
  },
  openGraph: {
    title: "リゾートホテル向け案内ページ作成 | Infomii",
    description: "リゾートホテル向けに、滞在導線・体験予約導線を最短3分で作成・公開。",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "リゾートホテル向け案内ページ作成 | Infomii",
    description: "リゾートホテル向けに、滞在導線・体験予約導線を最短3分で作成・公開。",
    images: ["/twitter-image"],
  },
};

export { default } from "../saas/page";
