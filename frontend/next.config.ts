import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/cable",
        destination: "http://localhost:3001/cable",
      },
    ];
  },
};

export default nextConfig;
