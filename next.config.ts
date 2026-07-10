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
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
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
