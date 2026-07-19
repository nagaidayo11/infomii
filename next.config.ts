import type { NextConfig } from "next";
import path from "path";

/** 親ディレクトリの lockfile 誤検出で Turbopack がホーム直下を root にしないよう固定 */
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  devIndicators: false,
  turbopack: {
    root: projectRoot,
  },
  /** Expo WebView など LAN IP から dev にアクセスするとき */
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.11.6"],
  /** dev で .next が壊れる（manifest ENOENT）対策 */
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = false;
      if (!isServer) {
        config.output = config.output ?? {};
        // HMR 中の再コンパイルで chunk 取得がタイムアウトしにくくする
        config.output.chunkLoadTimeout = 300000;
      }
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
          // Short cache so path removals (e.g. /v/*) propagate faster to Apple/CDN.
          { key: "Cache-Control", value: "public, max-age=300" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Three fictional "case study" articles were consolidated into one transparent
      // property-type guide. Preserve any existing authority with permanent redirects.
      {
        source: "/blog/hotel-case-study-business-qr",
        destination: "/blog/hotel-guide-scenarios-by-property",
        permanent: true,
      },
      {
        source: "/blog/hotel-case-study-boutique-inbound",
        destination: "/blog/hotel-guide-scenarios-by-property",
        permanent: true,
      },
      {
        source: "/blog/hotel-case-study-resort-multilingual",
        destination: "/blog/hotel-guide-scenarios-by-property",
        permanent: true,
      },
      {
        source: "/blog/why-use-infomii",
        destination: "/blog/infomii-features-overview",
        permanent: true,
      },
      {
        source: "/blog/infomii-gyomu-ni-dou-yakudatsu-ka",
        destination: "/blog/infomii-features-overview",
        permanent: true,
      },
      {
        source: "/blog/easy-guide-creation",
        destination: "/blog/how-to-create-hotel-guide",
        permanent: true,
      },
      {
        source: "/blog/review-score-guide-improvement",
        destination: "/blog/guest-satisfaction-guide-touchpoints",
        permanent: true,
      },
      {
        source: "/blog/qr-migration-from-legacy",
        destination: "/blog/hotel-paperless-guide-path",
        permanent: true,
      },
      {
        source: "/blog/team-management-benefits",
        destination: "/blog/guest-info-collaboration-safeguards",
        permanent: true,
      },
      {
        source: "/blog/front-desk-efficiency-digital",
        destination: "/blog/understaffed-front-guide-split",
        permanent: true,
      },
      {
        source: "/blog/guest-info-ongoing-improvement",
        destination: "/blog/guest-info-update-governance",
        permanent: true,
      },
      {
        source: "/blog/guest-info-weekly-review-playbook",
        destination: "/blog/guest-info-month-end-rollforward",
        permanent: true,
      },
      {
        source: "/blog/guest-info-staff-handoff-memos",
        destination: "/blog/staff-training-guide-shortcut",
        permanent: true,
      },
      {
        source: "/blog/night-shift-guide-coverage",
        destination: "/blog/overnight-trouble-contact-guide",
        permanent: true,
      },
      {
        source: "/blog/free-hotel-guide-tools-pick",
        destination: "/blog/canva-vs-guide-platform",
        permanent: true,
      },
      {
        source: "/blog/qr-guide-benefits-hospitality",
        destination: "/blog/hotel-guide-app-vs-qr-web",
        permanent: true,
      },
      {
        source: "/blog/guest-info-qr-touchpoints",
        destination: "/blog/checkin-qr-placement-hotel",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Share/QR entries — never listed in AASA applinks (avoids opening Infomii app).
      { source: "/qr/:slug", destination: "/v/:slug" },
      { source: "/go/:slug", destination: "/p/:slug" },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
