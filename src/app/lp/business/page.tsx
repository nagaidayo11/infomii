import type { Metadata } from "next";
import LpHotelSaaSPage from "@/components/lp/LpHotelSaaSPage";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export const metadata: Metadata = {
  title: "Infomii | QRひとつで館内案内を3分で。フロント向け",
  description:
    "口頭説明・紙更新の手間を減らすホテル向けSaaS。WiFi・朝食・設備を1つのQRに集約。まずは無料で3ページまで。",
  alternates: { canonical: `${appUrl}/lp/business` },
  openGraph: {
    url: `${appUrl}/lp/business`,
    title: "Infomii | QRひとつで館内案内を3分で",
    description:
      "フロントの説明と紙更新を減らし、ゲストには常に最新の案内を。登録なしのデモあり。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Infomii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii | QRひとつで館内案内を3分で",
    description: "フロント向け・少人数ホテル向け。WiFi・朝食・設備を3ページまで無料で運用。",
  },
};

export default LpHotelSaaSPage;
