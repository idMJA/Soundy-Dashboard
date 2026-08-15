import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	compress: true,
	images: {
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 86400, // 24 hours image caching
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
				port: "",
				pathname: "/**",
			},
		],
	},
	/* config options here */
};

export default nextConfig;
