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
    // Old paths from the pre-Holo-Terminal site. Keep external/bookmarked
    // links and the published note's /studio link from 404ing.
    { source: "/about", destination: "/story", permanent: true },
    { source: "/work", destination: "/projects", permanent: true },
    { source: "/studio", destination: "/projects", permanent: true },
  ],
};

export default nextConfig;
