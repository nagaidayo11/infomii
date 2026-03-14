import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "温浴・スパ向け案内ページ作成",
  description: "温浴・スパ向けに、利用ルールや混雑時導線を最短3分で作成・公開。",
  alternates: {
    canonical: "/lp/spa",
  },
  openGraph: {
    title: "温浴・スパ向け案内ページ作成 | Infomii",
    description: "温浴・スパ向けに、利用ルールや混雑時導線を最短3分で作成・公開。",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "温浴・スパ向け案内ページ作成 | Infomii",
    description: "温浴・スパ向けに、利用ルールや混雑時導線を最短3分で作成・公開。",
    images: ["/twitter-image"],
  },
};

export { default } from "../saas/page";
