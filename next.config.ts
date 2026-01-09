import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eu.louisvuitton.com",
      },
    ],
  },
};

export default nextConfig;
