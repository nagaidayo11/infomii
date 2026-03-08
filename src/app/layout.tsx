import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Infomii | ホテル案内ページ作成SaaS",
    template: "%s | Infomii",
  },
  description: "ホテル向け案内ページを最短3分で作成・公開。編集画面から即時更新でき、QR運用にも対応。",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Infomii",
    locale: "ja_JP",
    url: appUrl,
    title: "Infomii | ホテル案内ページ作成SaaS",
    description: "ホテル向け案内ページを最短3分で作成・公開。編集画面から即時更新でき、QR運用にも対応。",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Infomii | ホテル案内ページ作成SaaS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii | ホテル案内ページ作成SaaS",
    description: "ホテル向け案内ページを最短3分で作成・公開。編集画面から即時更新でき、QR運用にも対応。",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="lux-shell bg-white text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
