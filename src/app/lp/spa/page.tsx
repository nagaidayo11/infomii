import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "温浴・スパ向けインフォメーション｜スマホ案内を無料ではじめる",
  description:
    "温浴・スパの利用ルールや営業時間を、ゲストのスマホで見せる。紙の差し替え不要。無料で1ページから公開。",
  alternates: {
    canonical: "/lp/spa",
  },
  openGraph: {
    title: "温浴・スパ向けインフォメーション | Infomii",
    description: "混雑時の案内やハウスルールをQRで統一。スマホからその場で更新。",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "温浴・スパ向けインフォメーション | Infomii",
    description: "紙の案内をスマホへ。無料ではじめられます。",
    images: ["/twitter-image"],
  },
};

/** Vertical keyword LP: meta is spa-specific; body is the hotel product. */
export { default } from "../business/page";
