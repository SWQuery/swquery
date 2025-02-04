import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "via.placeholder.com",
      "assets.coingecko.com",
      "cdn.helius-rpc.com",
      "ipfs.io",
      "coin-images.coingecko.com",
      "gateway.pinata.cloud"
    ],
  },
};

export default nextConfig;