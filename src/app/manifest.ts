import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kendall Adkins — Senior Front End Engineer",
    short_name: "Kendall Adkins",
    description:
      "Senior Front End Engineer crafting performant, accessible, and visually refined interfaces.",
    start_url: "/",
    display: "standalone",
    background_color: "#06060e",
    theme_color: "#00d4ff",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
