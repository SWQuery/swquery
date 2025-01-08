import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		domains: ["via.placeholder.com", "assets.coingecko.com"],
	},
	swcMinify: false,
	/* other config options here */
};

export default nextConfig;
