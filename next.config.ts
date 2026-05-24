import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  headers: async () => [
    {
      source: "/((?!api|keystatic|_next).*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=3600, stale-while-revalidate=86400",
        },
      ],
    },
  ],
  redirects: async () => [
    { source: "/projects", destination: "/studio", permanent: true },
  ],
};

export default nextConfig;
