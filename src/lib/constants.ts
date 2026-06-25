export const SITE_URL = "https://kendalladkins.dev";
export const SITE_NAME = "Kendall Adkins";
export const SITE_TITLE =
  "Kendall Adkins — Software Engineer, Builder, and Yogi";
export const SITE_DESCRIPTION =
  "Software Engineer building performant, accessible, and visually refined web and mobile app experiences. Open to collaborations as a developer or project planner.";

// Single source of truth for the primary nav. Rendered identically on every
// page via HoloNav (used by both HoloFrame inner pages and the Gateway home).
export type NavItem = { label: string; href: string };
export const NAV_ITEMS: NavItem[] = [
  { label: "about", href: "/story" },
  { label: "work", href: "/work" },
  { label: "resume", href: "/resume" },
];
