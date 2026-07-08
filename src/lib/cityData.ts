// Static geometry + content for the walkable Neon City (/city).
// World is a fixed 2400×1600 canvas; all coords are world-space.
// Layout is the "v2" refresh: 4 destinations, off-center streets, the
// diagonal Adkins Line, Terminal Park as the center + way home.

import { PAGE_COPY } from "./constants";

export const WORLD = { w: 2400, h: 1600 };
export const CHAR_R = 13;
export const MARGIN = 26;
// Layout C: the arrival landing, just west of the Projects pavilion. The player
// steps off the train here, then walks around to the pavilion's right-side pad.
export const SPAWN = { x: 757, y: 714 };

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
// Grid nodes retired for V1 (the straight grid is gone, replaced by curved
// streets + one arterial). Kept as an empty export so the dormant traffic-light
// engine still compiles; V2 repopulates this when cars migrate to path-following.
export const NODES: { x: number; y: number }[] = [];

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
  nameplate: { x: 1230, y: 750 },
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
    sub: "( the pavilion )",
    hue: 190,
    x: 780,
    y: 640,
    w: 150,
    h: 260,
    pad: { x: 960, y: 822 },
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
    x: 340,
    y: 430,
    w: 300,
    h: 230,
    pad: { x: 490, y: 690 },
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
    x: 1640,
    y: 600,
    w: 270,
    h: 300,
    pad: { x: 1606, y: 735 },
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
    x: 820,
    y: 1250,
    w: 300,
    h: 180,
    pad: { x: 970, y: 1220 },
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
// Retired in the Layout C cutover. Phase 1 repopulates the outer city with the
// themed POIs (arcade, museum, ramen, night market, marina, ...) and gray shells
// from the arrival prototype. Empty for now so nothing overlaps the new layout.
export const FILLERS: Filler[] = [];

// ---- park furniture (from the arrival prototype; positions in/around the park) ----
// trees: circular collision (x,y = CENTER, r = radius). Prototype gives top-left +
// diameter; converted here to center+radius so collision (hitsSolid) stays correct.
export const TREES: { x: number; y: number; r: number }[] = [
  { x: 945, y: 615, r: 15 },
  { x: 1072, y: 587, r: 12 },
  { x: 1394, y: 599, r: 14 },
  { x: 1501, y: 636, r: 11 },
  { x: 948, y: 788, r: 13 },
  { x: 1318, y: 758, r: 13 },
  { x: 1477, y: 857, r: 12 },
  { x: 1021, y: 936, r: 11 },
  { x: 973, y: 493, r: 13 },
  { x: 1192, y: 482, r: 12 },
  { x: 1413, y: 498, r: 13 },
  { x: 433, y: 63, r: 13 },
  { x: 134, y: 714, r: 14 },
  { x: 71, y: 971, r: 11 },
  { x: 872, y: 1174, r: 12 },
  { x: 1571, y: 1196, r: 11 },
  { x: 1633, y: 953, r: 13 },
  { x: 712, y: 482, r: 12 },
  { x: 1212, y: 1482, r: 12 },
  { x: 1991, y: 251, r: 11 },
];
// benches: small AABB solids (x,y = top-left)
export const BENCHES: { x: number; y: number; w: number; h: number }[] = [
  { x: 990, y: 690, w: 46, h: 14 },
  { x: 1400, y: 710, w: 46, h: 14 },
  { x: 1010, y: 780, w: 14, h: 46 },
  { x: 1500, y: 800, w: 14, h: 46 },
  { x: 1360, y: 930, w: 46, h: 14 },
];
// street lamps (glow pools, brighten at night)
export const LAMPS: { x: number; y: number }[] = [
  { x: 1075, y: 545 },
  { x: 770, y: 950 },
  { x: 365, y: 1108 },
  { x: 1900, y: 1055 },
  { x: 620, y: 292 },
];

// district ground labels (rotated mono)
// Faint ground labels for the Layout C districts (from the arrival prototype).
export const DISTRICT_LABELS: {
  text: string;
  x: number;
  y: number;
  size: number;
  col: string;
}[] = [
  { text: "NORTH GRID", x: 640, y: 218, size: 13, col: "rgba(150,140,220,.3)" },
  {
    text: "DOCKSIDE",
    x: 2035,
    y: 1030,
    size: 13,
    col: "rgba(140,190,235,.34)",
  },
  {
    text: "FAIRGROUNDS",
    x: 150,
    y: 1240,
    size: 13,
    col: "rgba(220,140,220,.3)",
  },
  {
    text: "THE LANDING",
    x: 500,
    y: 878,
    size: 11,
    col: "rgba(150,140,220,.32)",
  },
];

// District ground blobs (soft color washes under the streets).
export const BLOBS: {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  br: string;
  bg: string;
}[] = [
  {
    x: 600,
    y: 150,
    w: 900,
    h: 300,
    rot: -2,
    br: "45% 40% 42% 46%",
    bg: "rgba(150,140,220,.03)",
  },
  {
    x: 1850,
    y: 380,
    w: 520,
    h: 660,
    rot: 3,
    br: "42% 46% 40% 44%",
    bg: "rgba(120,180,220,.028)",
  },
  {
    x: 60,
    y: 1150,
    w: 700,
    h: 420,
    rot: -3,
    br: "46% 42% 44% 40%",
    bg: "rgba(220,120,200,.022)",
  },
  {
    x: 240,
    y: 480,
    w: 520,
    h: 520,
    rot: 2,
    br: "44% 46% 42% 45%",
    bg: "rgba(150,140,220,.026)",
  },
];

// ---- traffic ----
export type Car = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  hue: number;
};
