import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth-provider";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** エディタのフォント選択で使う日本語 Web フォント（公開ページプレビューでも利用） */
const editorGoogleFontsHref =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Inter:wght@400;500;600;700",
    "family=Zen+Kaku+Gothic+New:wght@400;700",
    "family=M+PLUS+Rounded+1c:wght@400;700",
    "family=Kosugi+Maru",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
