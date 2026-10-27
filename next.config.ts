import type { NextConfig } from "next";
import shopRedirects from "./data/shop-redirects.json";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  /* 같은 가게 중복 행을 합친 뒤 지운 id → 남긴 id (색인·공유 링크 보존) */
  async redirects() {
    return Object.entries(shopRedirects).map(([from, to]) => ({
      source: `/shop/${from}`,
      destination: `/shop/${to}`,
      permanent: true,
    }));
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
};

export default nextConfig;
