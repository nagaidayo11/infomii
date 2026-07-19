import type { Metadata } from "next";
import LpHotelSaaSPage from "@/components/lp/LpHotelSaaSPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { HOTEL_LP_FAQ } from "@/lib/lp/hotel-data";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/structured-data";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export const metadata: Metadata = {
  title: {
    absolute: "リゾートホテル向けインフォメーション｜スマホ案内を無料ではじめる | Infomii",
  },
  description:
    "リゾートホテルの滞在案内・体験導線・食事時間を、ゲストのスマホで見せる。紙の差し替え不要。無料で1ページから公開。",
  alternates: {
    canonical: "/lp/resort",
  },
  openGraph: {
    url: `${appUrl}/lp/resort`,
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

/** Vertical keyword LP: resort-specific metadata + shared hotel product body. */
export default function LpResortPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          websiteJsonLd(),
          softwareApplicationJsonLd(),
          breadcrumbJsonLd([
            { name: "ホーム", path: "/lp/business" },
            { name: "リゾート向け", path: "/lp/resort" },
          ]),
          faqJsonLd(HOTEL_LP_FAQ),
        ]}
      />
      <LpHotelSaaSPage />
    </>
  );
}
