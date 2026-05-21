import type { NextConfig } from "next";
import path from "path";

/** 親ディレクトリの lockfile 誤検出で Turbopack がホーム直下を root にしないよう固定 */
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
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
