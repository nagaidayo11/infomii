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
    absolute: "温浴・スパ向けインフォメーション｜スマホ案内を無料ではじめる | Infomii",
  },
  description:
    "温浴・スパの利用ルールや営業時間を、ゲストのスマホで見せる。紙の差し替え不要。無料で1ページから公開。",
  alternates: {
    canonical: "/lp/spa",
  },
  openGraph: {
    url: `${appUrl}/lp/spa`,
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

/** Vertical keyword LP: spa-specific metadata + shared hotel product body. */
export default function LpSpaPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          websiteJsonLd(),
          softwareApplicationJsonLd(),
          breadcrumbJsonLd([
            { name: "ホーム", path: "/lp/business" },
            { name: "温浴・スパ向け", path: "/lp/spa" },
          ]),
          faqJsonLd(HOTEL_LP_FAQ),
        ]}
      />
      <LpHotelSaaSPage />
    </>
  );
}
