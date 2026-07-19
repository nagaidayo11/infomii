import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { ClientShellProvider } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";
import { ButtonLiftProvider } from "@/components/providers/ButtonLiftProvider";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";
const metadataBase = (() => {
  try {
    const u = appUrl?.trim();
    if (u && u.startsWith("http")) return new URL(u);
  } catch {
    /* fallback */
  }
  return new URL("https://infomii.com");
})();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Infomii | ホテル案内ページ作成SaaS",
    template: "%s | Infomii",
  },
  description: "ホテル向け案内ページを最短3分で作成・公開。編集画面から即時更新でき、QR運用にも対応。",
  alternates: {
    canonical: "/lp/business",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "Infomii",
    locale: "ja_JP",
    url: `${appUrl}/lp/business`,
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
  // Search Console 等の所有権確認。トークンは env で差し替え（未設定なら出力しない）。
  ...((process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION)
    ? {
        verification: {
          ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
            ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
            : {}),
          ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
            ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
            : {}),
        },
      }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * エディタのフォント選択で使う日本語 Web フォント（公開ページプレビューでも利用）。
 * ここに載せるファミリーは EDITOR_FONT_OPTIONS / LP typography で実際に使うものだけに絞る
 * （未使用ファミリーはレンダーブロッキングなCSSを増やしLCPを悪化させるため）。
 */
const editorGoogleFontsHref =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Inter:wght@400;500;600;700",
    "family=M+PLUS+Rounded+1c:wght@400;700",
    "family=Shippori+Mincho:wght@400;600",
    "family=Noto+Sans+JP:wght@400;700",
    "family=Noto+Serif+JP:wght@400;600",
  ].join("&") +
  "&display=swap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={editorGoogleFontsHref} />
      </head>
      <body className="font-sans lux-shell ds-app min-h-[100dvh] overflow-x-hidden bg-ds-bg text-ds-foreground antialiased [-webkit-tap-highlight-color:transparent]">
        <GoogleAnalytics />
        <AuthProvider>
          <Suspense fallback={null}>
            <ClientShellProvider>
              <ButtonLiftProvider>{children}</ButtonLiftProvider>
            </ClientShellProvider>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
