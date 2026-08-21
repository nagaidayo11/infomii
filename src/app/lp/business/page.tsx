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
    absolute: "Infomii｜ホテル館内案内をスマホ化・ペーパーレス — 無料ではじめる",
  },
  description:
    "ホテルの館内案内をQRとスマホページで運用。紙の差し替えを減らし、Wi-Fi・朝食・設備案内を現場が自分で更新。テンプレから数分で公開、クレジットカード不要で無料開始。",
  alternates: { canonical: `${appUrl}/lp/business` },
  openGraph: {
    url: `${appUrl}/lp/business`,
    title: "Infomii｜ホテル館内案内をスマホ化・ペーパーレス",
    description:
      "館内案内の作成から公開・現場更新・多言語まで。紙運用を減らし、ITなしでも案内を回せます。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Infomii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii｜ホテル館内案内をスマホ化・ペーパーレス",
    description: "館内案内をQRとスマホで。テンプレから数分公開。無料開始・クレカ不要。",
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
            { name: "ホーム", path: "/lp/business" },
            { name: "ホテル向け", path: "/lp/business" },
          ]),
          faqJsonLd(HOTEL_LP_FAQ),
        ]}
      />
      <LpHotelSaaSPage />
    </>
  );
}
