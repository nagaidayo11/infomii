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
    absolute: "Infomii | ホテル案内を、現場が自分で回す — 無料ではじめる",
  },
  description:
    "ホテル向け案内運用OS。テンプレから数分で公開し、QR・多言語・チーム更新まで1つの流れで。クレジットカード不要で2ページまで無料。",
  alternates: { canonical: `${appUrl}/lp/business` },
  openGraph: {
    url: `${appUrl}/lp/business`,
    title: "Infomii | ホテル案内を、現場が自分で回す",
    description:
      "作成から公開・現場更新・多言語まで。ホテル向けテンプレで、ITなしでも案内運用を回せます。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Infomii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii | ホテル案内を、現場が自分で回す",
    description: "ホテル向け案内運用OS。テンプレから数分で公開。無料2ページ・クレカ不要。",
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
