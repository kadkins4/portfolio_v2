import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kendall Adkins — Senior Software Engineer",
    short_name: "Kendall Adkins",
    description:
      "Senior Software Engineer crafting performant, accessible, and visually refined interfaces.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0b09",
    theme_color: "#a08060",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
