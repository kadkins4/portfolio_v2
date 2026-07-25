export const SITE_URL = "https://kendalladkins.dev";
export const SITE_NAME = "Kendall Adkins";
export const SITE_TITLE =
  "Kendall Adkins — Software Engineer, Builder, and Yogi";
export const SITE_DESCRIPTION =
  "Software Engineer building performant, accessible, and visually refined web and mobile app experiences. Open to collaborations as a developer or project planner.";

// Single source of truth for the primary nav. Rendered identically on every
// page via HoloNav, which HoloFrame wraps around inner pages.
export type NavItem = { label: string; href: string };
export const NAV_ITEMS: NavItem[] = [
  { label: "projects", href: "/projects" },
  { label: "resume", href: "/resume" },
  { label: "about", href: "/about" },
];

// Headline copy per destination, kept here so a single edit propagates.
// `title` is reused by BOTH the city storefront teaser (see cityData) and the
// page header, so changing it in one place updates the city and the page.
// kicker/sub drive the page header only (the city keeps its own front-door
// flavor line).
export const PAGE_COPY = {
  projects: {
    kicker: "✦ ENGINEERING DISTRICT · MIXED ZONING",
    title: "Work, Projects, & Words",
    sub: "kendall@city:~$ cd projects/ && ls --lit",
  },
} as const;
