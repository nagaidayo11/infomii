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
  title: "Infomii | ホテルのインフォメーションをスマホで — 無料ではじめる",
  description:
    "紙の館内案内から、スマホのインフォメーションへ。Wi-Fi・朝食・館内案内をQRで公開。クレジットカード不要で2ページまで無料。",
  alternates: { canonical: `${appUrl}/lp/business` },
  openGraph: {
    url: `${appUrl}/lp/business`,
    title: "Infomii | ホテルのインフォメーションをスマホで",
    description:
      "ホテル・旅館・民泊向け。差し替え不要、その場で更新。まず無料登録から。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Infomii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii | ホテルのインフォメーションをスマホで",
    description: "紙の館内案内をスマホへ。無料2ページ・クレカ不要・数分で公開。",
  },
};

export default function LpBusinessPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          websiteJsonLd(),
          softwareApplicationJsonLd(),
          breadcrumbJsonLd([
            { name: "ホーム", path: "/" },
            { name: "ホテル向け", path: "/lp/business" },
          ]),
          faqJsonLd(HOTEL_LP_FAQ),
        ]}
      />
      <LpHotelSaaSPage />
    </>
  );
}
