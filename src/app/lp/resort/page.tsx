import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "リゾートホテル向けインフォメーション｜スマホ案内を無料ではじめる",
  description:
    "リゾートホテルの滞在案内・体験導線・食事時間を、ゲストのスマホで見せる。紙の差し替え不要。無料で1ページから公開。",
  alternates: {
    canonical: "/lp/resort",
  },
  openGraph: {
    title: "リゾートホテル向けインフォメーション | Infomii",
    description:
      "滞在中の案内をスマホに。送迎・アクティビティ・食事時間をQRで統一。",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "リゾートホテル向けインフォメーション | Infomii",
    description: "紙の館内案内をスマホへ。無料ではじめられます。",
    images: ["/twitter-image"],
  },
};

/** Vertical keyword LP: meta is resort-specific; body is the hotel product. */
export { default } from "../business/page";
