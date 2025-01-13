import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "via.placeholder.com",
      "assets.coingecko.com",
      "cdn.helius-rpc.com",
      "ipfs.io",
    ],
  },
};

export default nextConfig;