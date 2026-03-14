import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export const metadata: Metadata = {
  title: "Infomii | Create hotel information pages in 3 minutes",
  description:
    "Share WiFi, breakfast, and facility information with guests via a simple QR page. Modern, minimal SaaS for hotels.",
  alternates: { canonical: "/" },
  openGraph: {
    url: appUrl,
    title: "Infomii | Create hotel information pages in 3 minutes",
    description:
      "Share WiFi, breakfast, and facility information with guests via a simple QR page.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Infomii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii | Hotel information pages in 3 minutes",
    description: "Share WiFi, breakfast, and facility info with guests via QR.",
  },
};

export { default } from "./lp/saas/page";
