import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Infomii",
    short_name: "Infomii",
    description: "ホテル向け案内ページ作成SaaS",
    start_url: "/",
    display: "standalone",
    background_color: "#ecfdf5",
    theme_color: "#10b981",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
    id: appUrl,
  };
}
