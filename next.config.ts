import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    // Cloudflare Pages doesn't support Next.js image optimization — use unoptimized
    unoptimized: true,
  },
};

export default nextConfig;
