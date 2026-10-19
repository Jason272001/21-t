import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
