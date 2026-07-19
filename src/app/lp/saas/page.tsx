import type { Metadata } from "next";
import LpPersonalSaaSPage from "@/components/lp/LpPersonalSaaSPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { PERSONAL_LP_FAQ } from "@/lib/lp/personal-data";
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
    absolute: "Infomii | 情報を1ページに。旅行・推し活・案内を無料ではじめる",
  },
  description:
    "旅行しおり、推し活、イベントまで。伝えたい情報をスマホでまとめてURL共有。クレジットカード不要で2ページまで無料公開。",
  alternates: { canonical: `${appUrl}/lp/saas` },
  keywords: [
    "情報整理",
    "旅行しおり",
    "推し活",
    "リンク共有",
    "スマホ案内",
    "QR共有",
  ],
  openGraph: {
    url: `${appUrl}/lp/saas`,
    title: "Infomii | 情報を1ページに。無料ではじめる",
    description:
      "旅行・推し活・おでかけの情報を1ページに。クレジットカード不要で数分から公開。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Infomii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii | 情報を1ページに",
    description: "旅行しおり・推し活・イベント共有。無料2ページ・クレカ不要。",
  },
};

export default function LpSaasPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          websiteJsonLd(),
          softwareApplicationJsonLd(),
          breadcrumbJsonLd([
            { name: "ホーム", path: "/lp/business" },
            { name: "サービス紹介", path: "/lp/saas" },
          ]),
          faqJsonLd(PERSONAL_LP_FAQ),
        ]}
      />
      <LpPersonalSaaSPage />
    </>
  );
}
