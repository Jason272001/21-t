import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/admin57/join/:path*",
      headers: [
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "X-Robots-Tag", value: "noindex, nofollow, nosnippet" },
      ],
    },
  ],
  experimental: {
    externalDir: true,
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
