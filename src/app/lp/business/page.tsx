import type { Metadata } from "next";
import LpHotelSaaSPage from "@/components/lp/LpHotelSaaSPage";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export const metadata: Metadata = {
  title: "Infomii | ホテル・旅館向け館内案内 — 無料ではじめる",
  description:
    "フロントの説明と紙更新を減らす、ホテル向けQR案内。Wi-Fi・朝食・FAQを1ページに。クレジットカード不要で2ページまで無料公開。",
  alternates: { canonical: `${appUrl}/lp/business` },
  openGraph: {
    url: `${appUrl}/lp/business`,
    title: "Infomii | ホテル現場で軽く使える館内案内",
    description:
      "ホテル・旅館・民泊向け。紙差し替え不要、QRで案内統一。まず無料登録から。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Infomii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii | ホテル向け館内案内",
    description: "フロント負荷を減らすQR案内。無料2ページ・クレカ不要・数分で公開。",
  },
};

export default LpHotelSaaSPage;
