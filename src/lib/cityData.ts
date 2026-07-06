// Static geometry + content for the walkable Neon City (/city).
// World is a fixed 2400×1600 canvas; all coords are world-space.
// Layout is the "v2" refresh: 4 destinations, off-center streets, the
// diagonal Adkins Line, Terminal Park as the center + way home.

import { PAGE_COPY } from "./constants";

export const WORLD = { w: 2400, h: 1600 };
export const CHAR_R = 13;
export const MARGIN = 26;
export const SPAWN = { x: 1230, y: 940 };

// hue → oklch accent
export const HUES: Record<number, string> = {
  190: "oklch(0.85 0.13 190)", // cyan  — engineering
  46: "oklch(0.84 0.14 46)", // amber — residential
  340: "oklch(0.8 0.16 340)", // pink  — atmosphere
  300: "oklch(0.8 0.11 300)", // lavender — postal
};
export function hueColor(h: number, l = 0.84, c = 0.13, a?: number): string {
  const alpha = a === undefined ? "" : ` / ${a}`;
  return `oklch(${l} ${c} ${h}${alpha})`;
}

// ---- streets (centerlines; all 80px wide) ----
export const ROAD_W = 80;
export const ROADS_H = [360, 1040]; // y centerlines
export const ROADS_V = [320, 1880]; // x centerlines
export const NODES = [
  { x: 320, y: 360 },
  { x: 1880, y: 360 },
  { x: 320, y: 1040 },
  { x: 1880, y: 1040 },
];

// ---- the Adkins Line (diagonal elevated rail) ----
export const RAIL = {
  x0: -140,
  y0: 1560,
  ux: 0.8985,
  uy: -0.4393,
  length: 3005,
  angleDeg: -26.06,
  stationScalar: 1560,
  wrapMax: 3300,
  wrapMin: -320,
};
export function railPoint(s: number): { x: number; y: number } {
  return { x: RAIL.x0 + s * RAIL.ux, y: RAIL.y0 + s * RAIL.uy };
}

// ---- Terminal Park (hero + home anchor) ----
export const PARK = {
  x: 900,
  y: 560,
  w: 660,
  h: 450,
  radius: "190px 70px 210px 90px",
  nameplate: { x: 1090, y: 700 },
  platform: { x: 1110, y: 874, w: 240, h: 32 },
};

// ---- destination buildings ----
export type Destination = {
  key: "projects" | "resume" | "about" | "contact";
  sign: string;
  sub: string;
  hue: number;
  x: number;
  y: number;
  w: number;
  h: number;
  pad: { x: number; y: number };
  href: string;
  teaser: { kicker: string; title: string; blurb: string; cta: string };
};

const PAD_W = 66;
const PAD_H = 46;

export const DESTINATIONS: Destination[] = [
  {
    key: "projects",
    sign: "PROJECTS",
    sub: "( the district )",
    hue: 190,
    x: 500,
    y: 90,
    w: 380,
    h: 230,
    pad: { x: 660, y: 344 },
    href: "/projects",
    teaser: {
      kicker: "✦ ENGINEERING QUARTER · STOREFRONTS LIT",
      title: PAGE_COPY.projects.title,
      blurb: "Shipped products and the notes behind them, all on one block.",
      cta: "> enter projects",
    },
  },
  {
    key: "resume",
    sign: "ADKINS LINE",
    sub: "( resume )",
    hue: 190,
    x: 460,
    y: 610,
    w: 320,
    h: 270,
    pad: { x: 806, y: 710 },
    href: "/resume",
    teaser: {
      kicker: "✦ NEON CITY TRANSIT · CAREER SERVICE",
      title: "Ride the career line.",
      blurb: "A decade of engineering as a transit map, most recent first.",
      cta: "> ride the line",
    },
  },
  {
    key: "about",
    sign: "UNIT 4B",
    sub: "( about )",
    hue: 46,
    x: 2040,
    y: 90,
    w: 240,
    h: 240,
    pad: { x: 2014, y: 175 },
    href: "/about",
    teaser: {
      kicker: "✦ NEON CITY HOUSING · RESIDENT 4B",
      title: "Come on in.",
      blurb: "The human one: how I got here, and life outside the code.",
      cta: "> knock on 4B",
    },
  },
  {
    key: "contact",
    sign: "POST OFFICE",
    sub: "( contact )",
    hue: 300,
    x: 1100,
    y: 1200,
    w: 300,
    h: 210,
    pad: { x: 1220, y: 1176 },
    href: "/contact",
    teaser: {
      kicker: "✦ NEON CITY POST OFFICE · DISPATCH DESK",
      title: "Drop a letter.",
      blurb:
        "A role, a project, or a good reason to say hi. The desk is staffed.",
      cta: "> open the post office",
    },
  },
];

export function padRect(d: Destination) {
  return { x: d.pad.x - PAD_W / 2, y: d.pad.y - PAD_H / 2, w: PAD_W, h: PAD_H };
}

// ---- filler buildings (atmosphere, collidable, non-interactive) ----
export type Filler = {
  x: number;
  y: number;
  w: number;
  h: number;
  sign: string;
  hue: number;
};
export const FILLERS: Filler[] = [
  { x: 40, y: 90, w: 150, h: 150, sign: "FOUNDRY", hue: 190 },
  { x: 50, y: 470, w: 160, h: 150, sign: "DATAWORKS", hue: 190 },
  { x: 60, y: 760, w: 150, h: 140, sign: "ARCADE", hue: 190 },
  { x: 60, y: 1160, w: 150, h: 150, sign: "DEPOT", hue: 300 },
  { x: 980, y: 70, w: 150, h: 120, sign: "RAMEN", hue: 46 },
  { x: 1200, y: 60, w: 160, h: 130, sign: "BATHS", hue: 190 },
  { x: 1440, y: 80, w: 150, h: 120, sign: "PAWN", hue: 340 },
  { x: 1660, y: 70, w: 150, h: 140, sign: "KIOSK", hue: 300 },
  { x: 1600, y: 600, w: 160, h: 140, sign: "TEA HOUSE", hue: 46 },
  { x: 1610, y: 820, w: 150, h: 120, sign: "RECORDS", hue: 340 },
  { x: 420, y: 1150, w: 180, h: 140, sign: "NOODLE BAR", hue: 46 },
  { x: 660, y: 1160, w: 160, h: 140, sign: "DOJO", hue: 340 },
  { x: 880, y: 1420, w: 170, h: 120, sign: "SORTING", hue: 300 },
  { x: 1520, y: 1150, w: 150, h: 140, sign: "KATANA", hue: 340 },
  { x: 1610, y: 1400, w: 180, h: 120, sign: "CINEMA", hue: 46 },
  { x: 1980, y: 470, w: 170, h: 150, sign: "BODEGA", hue: 46 },
  { x: 2190, y: 660, w: 160, h: 150, sign: "24H MART", hue: 46 },
  { x: 1980, y: 900, w: 170, h: 140, sign: "BAZAAR", hue: 340 },
  { x: 2190, y: 1150, w: 170, h: 150, sign: "POST HUB", hue: 300 },
];

// ---- park furniture ----
// trees: circular collision (x,y = center, r = radius)
export const TREES: { x: number; y: number; r: number }[] = [
  { x: 960, y: 610, r: 30 },
  { x: 1060, y: 590, r: 22 },
  { x: 1470, y: 620, r: 28 },
  { x: 980, y: 950, r: 26 },
  { x: 1450, y: 940, r: 30 },
  { x: 1520, y: 780, r: 22 },
  { x: 930, y: 780, r: 24 },
  { x: 1360, y: 980, r: 24 },
  { x: 1180, y: 600, r: 26 },
  { x: 1040, y: 860, r: 20 },
];
// benches: small AABB solids (x,y = top-left)
export const BENCHES: { x: number; y: number; w: number; h: number }[] = [
  { x: 1000, y: 720, w: 46, h: 14 },
  { x: 1300, y: 720, w: 46, h: 14 },
  { x: 1120, y: 840, w: 14, h: 46 },
  { x: 1400, y: 640, w: 14, h: 46 },
  { x: 980, y: 660, w: 46, h: 14 },
];
// street lamps (glow pools, brighten at night)
export const LAMPS: { x: number; y: number }[] = [
  { x: 280, y: 320 },
  { x: 360, y: 400 },
  { x: 1840, y: 320 },
  { x: 1920, y: 400 },
  { x: 280, y: 1000 },
  { x: 360, y: 1080 },
  { x: 1840, y: 1000 },
  { x: 1920, y: 1080 },
  { x: 1100, y: 360 },
  { x: 900, y: 1040 },
  { x: 1400, y: 1040 },
  { x: 320, y: 700 },
];

// district ground labels (rotated mono)
export const DISTRICT_LABELS: {
  text: string;
  x: number;
  y: number;
  hue: number;
  rot: number;
}[] = [
  { text: "ENGINEERING QUARTER", x: 300, y: 210, hue: 190, rot: 0 },
  { text: "RESIDENTIAL ROW", x: 1980, y: 470, hue: 46, rot: 1.2 },
  { text: "POSTAL DISTRICT", x: 780, y: 1500, hue: 300, rot: -1 },
];

// ---- traffic ----
export type Car = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  hue: number;
};
