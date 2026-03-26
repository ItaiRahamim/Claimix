import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages (next-on-pages adapter)
  experimental: {
    runtime: "edge",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    // Cloudflare Pages doesn't support Next.js image optimization — use unoptimized
    unoptimized: true,
  },
};

export default nextConfig;
