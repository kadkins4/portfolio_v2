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
    // Neon City IA — three doors absorb the old standalone pages.
    // Projects holds notes; Resume holds the stack; About holds story + life.
    { source: "/story", destination: "/about", permanent: true },
    { source: "/life", destination: "/about", permanent: true },
    { source: "/stack", destination: "/resume", permanent: true },
    { source: "/notes", destination: "/projects", permanent: true },
    // Older pre-Holo-Terminal paths.
    { source: "/work", destination: "/projects", permanent: true },
    { source: "/studio", destination: "/projects", permanent: true },
  ],
};

export default nextConfig;
