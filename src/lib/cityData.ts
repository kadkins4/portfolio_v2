// Static geometry + content for the walkable Neon City (/city).
// World is a fixed 3200×1600 canvas; all coords are world-space. The east
// 800px is the Galleria district, added when the projects mall landed.
// Layout C: destinations clustered around Terminal Park, curved streets, the
// curved Adkins Line rail with a west-side landing, themed POIs + gray shells.

import { PAGE_COPY } from "./constants";

export const WORLD = { w: 3200, h: 1600 };
export const CHAR_R = 13;
export const MARGIN = 26;

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
// Grid nodes retired for V1 (the straight grid is gone, replaced by curved
// streets + one arterial). Kept as an empty export so the dormant traffic-light
// engine still compiles; V2 repopulates this when cars migrate to path-following.
export const NODES: { x: number; y: number }[] = [];

// ---- the Adkins Line (curved elevated rail) ----
// SVG path in world space; the train path-follows it via getPointAtLength.
// It enters from the south edge, curls around the WEST of the park, and pulls
// into the vertical platform beside the park (x ~= 680).
export const RAIL_PATH =
  "M 720 1660 C 750 1480 800 1420 770 1300 C 745 1195 600 1170 590 1030 C 583 930 680 905 680 810 L 680 480 C 680 330 640 260 560 200 C 470 130 380 80 320 -40";

// ---- Terminal station (the end of the Adkins Line) ----
// The platform sits on the WEST side of the track, in the gap beside the
// ADKINS LINE building, so you step off facing your destination instead of
// walking around the train. Everything here is world-space and drives both the
// renderer (TerminalStation) and the arrival walk — declare the geometry once.
export const TERMINAL = (() => {
  // the track's vertical run; the platform hugs its west flank
  const railX = 680;
  const platW = 32;
  const platX = railX - 8 - platW; // 640 — flush with the resume building's east wall
  return {
    railX,
    platform: { x: platX, y: 560, w: platW, h: 230 },
    // steps down to the street, aimed west at the ADKINS LINE doors. The tread
    // line sits at the resume pad's own centre-y, so the walk off the stairs is
    // a straight shot onto the mat.
    stairs: { x: platX - 52, y: 670, w: 52, h: 40 },
    // ticket hall at the foot of the stairs — the only solid here, so the
    // platform lane itself stays walkable end to end
    house: { x: platX - 84, y: 724, w: 84, h: 74 },
    // platform dressing. All scenery: the deck is only 32px wide, so anything
    // solid standing on it would wall the lane off (the player is 26px across).
    board: { x: platX + 8, y: 572, w: 20, h: 30 },
    bench: { x: platX + 9, y: 744, w: 18, h: 34 },
    canopy: { x: platX, y: 600, w: platW, h: 120 },
    // where the arrival walk ends and you take control, at the stairs' foot
    landing: { x: platX - 62, y: 690 },
  };
})();

// The player steps off the train onto the west platform and down the stairs,
// landing here — a short straightaway east of the ADKINS LINE entry mat.
export const SPAWN = { x: TERMINAL.landing.x, y: TERMINAL.landing.y };

// ---- Terminal Park (hero + home anchor) ----
export const PARK = {
  x: 900,
  y: 560,
  w: 660,
  h: 450,
  radius: "190px 70px 210px 90px",
  nameplate: { x: 1150, y: 800 },
  // reflecting pond, park-relative top-left + diameter (the layer renders it
  // inside the park div, so these stay park-relative)
  pond: { rx: 310, ry: 50, d: 90 },
};

// The pond in world space, and the fountain standing at its middle. Collision
// reads these, the park layer renders from them — one edit moves both.
export const POND = {
  x: PARK.x + PARK.pond.rx + PARK.pond.d / 2,
  y: PARK.y + PARK.pond.ry + PARK.pond.d / 2,
  r: PARK.pond.d / 2,
};
// basin is 34px across; round up so you bump the stone, not the spray
export const FOUNTAIN_R = 19;
// The v3 mockup put a "Terminal Walk" footbridge at (730, 706). It was dropped:
// the bridge only fits in the mockup's layout, which deletes the Projects
// pavilion. We keep the pavilion, so the bridge would run straight through it.

// ---- The Galleria (projects mall) ----
// A walk-in mall on the east side. Geometry is declared here ONCE: GalleriaLayer
// renders the walls from `GALLERIA.walls`, and cityCollision reads the same
// array — a wall you can see is a wall you can't pass, with no second edit.
// Reposition the whole mall by changing `ox`/`oy`; everything else derives.
export const GALLERIA = (() => {
  const ox = 2560;
  const oy = 430;
  const w = 520;
  const h = 620;
  const wall = 16; // wall thickness; the interior begins `wall` px inside
  const gapTop = 690; // entrance gap in the west wall (world-space y range)
  const gapBot = 780;
  return {
    x: ox,
    y: oy,
    w,
    h,
    wall,
    gap: { top: gapTop, bot: gapBot },
    // perimeter colliders — the west wall is split around the entrance gap
    walls: [
      { x: ox, y: oy, w, h: wall }, // north
      { x: ox, y: oy + h - wall, w, h: wall }, // south
      { x: ox + w - wall, y: oy, w: wall, h }, // east
      { x: ox, y: oy, w: wall, h: gapTop - oy }, // west, above the gap
      { x: ox, y: gapBot, w: wall, h: oy + h - gapBot }, // west, below the gap
    ] as { x: number; y: number; w: number; h: number }[],
    // decorative foreground element outside the entrance; collidable
    kiosk: { x: 2410, y: 560, w: 90, h: 80 },
    // courtyard fountain (mall-rel 204,254) — a solid centerpiece; the
    // directory board beside it is render-only
    fountain: { x: ox + 204, y: oy + 254, w: 52, h: 52 },
    directory: { x: ox + 100, y: oy + 270, w: 26, h: 40 },
    label: { text: "GALLERIA DISTRICT", x: 2640, y: 1108 },
    // roof-open trigger zones (world-space). Derived per frame from the player
    // position — no state, so the roof reverses on exit for free.
    open: {
      inside: {
        x0: ox + wall,
        x1: ox + w - wall,
        y0: oy + wall,
        y1: oy + h - wall,
      },
      nearGap: { x0: ox - 60, x1: ox + 40, y0: oy + 240, y1: oy + 370 },
    },
  };
})();

export type RoofAnim = "split" | "iris" | "fade";

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
  // entry pad: center (x,y) + size (w,h), matching the prototype's per-spot pads
  pad: { x: number; y: number; w: number; h: number };
  // lit accent entrance strip, offsets relative to the building's top-left.
  // Omitted by walk-in buildings, which draw their doorway from their own
  // wall gap instead (see APARTMENT) — a door here would drive nothing.
  door?: { x: number; y: number; w: number; h: number };
  // optional world-space stoop drawn beside the building (the pavilion's stairs)
  stairs?: { x: number; y: number; w: number; h: number };
  href: string;
  teaser: { kicker: string; title: string; blurb: string; cta: string };
};

export const DESTINATIONS: Destination[] = [
  {
    key: "projects",
    sign: "PAVILION",
    sub: "( projects )",
    hue: 190,
    x: 780,
    y: 640,
    w: 150,
    h: 260,
    pad: { x: 960, y: 842, w: 44, h: 64 },
    door: { x: 144, y: 180, w: 6, h: 38 },
    stairs: { x: 736, y: 655, w: 44, h: 64 },
    href: "/projects",
    teaser: {
      kicker: "✦ ENGINEERING QUARTER · STOREFRONTS LIT",
      title: PAGE_COPY.projects.title,
      blurb:
        "Shipped products and the notes behind them, all on one block. Visit Galleria for Individual Projects",
      cta: "> enter projects",
    },
  },
  {
    key: "resume",
    sign: "TERMINAL PARK STATION",
    sub: "( resume )",
    hue: 190,
    x: 320,
    y: 430,
    w: 300,
    h: 200,
    pad: { x: 490, y: 690, w: 70, h: 44 },
    door: { x: 130, y: 198, w: 38, h: 6 },
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
    // the mat lives INSIDE, sitting flush on the desk's north edge beside the
    // chair — you walk in and step up to the computer to open the About page
    pad: { x: 1728, y: 838, w: 48, h: 30 },
    href: "/about",
    teaser: {
      kicker: "✦ NEON CITY STUDIO · RESIDENT 4B",
      title: "Boot Up The PC",
      blurb: "How I got here. Life outside code.",
      cta: "> Power On",
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
    pad: { x: 970, y: 1220, w: 70, h: 44 },
    door: { x: 131, y: 1, w: 38, h: 6 },
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

// ---- Unit 4B (the about apartment) ----
// A walk-in studio, same contract as the Galleria: geometry declared once here,
// ApartmentLayer renders from it, cityCollision reads the same rects. The west
// wall is split around the doorway so you can step inside; the interaction mat
// sits on the floor at the desk rather than out on the street.
export const APARTMENT = (() => {
  const d = DESTINATIONS.find((x) => x.key === "about")!;
  const { x: ox, y: oy, w, h } = d;
  const wall = 14;
  const gapTop = oy + 120;
  const gapBot = oy + 190;
  return {
    x: ox,
    y: oy,
    w,
    h,
    wall,
    gap: { top: gapTop, bot: gapBot },
    walls: [
      { x: ox, y: oy, w, h: wall }, // north
      { x: ox, y: oy + h - wall, w, h: wall }, // south
      { x: ox + w - wall, y: oy, w: wall, h }, // east
      { x: ox, y: oy, w: wall, h: gapTop - oy }, // west, above the door
      { x: ox, y: gapBot, w: wall, h: oy + h - gapBot }, // west, below the door
    ] as { x: number; y: number; w: number; h: number }[],
    // furnishings you bump into, laid out around a clear walking lane
    furniture: [
      // bed runs north-south along the east wall, headboard end at the top
      { id: "bed", x: ox + w - wall - 68, y: oy + 18, w: 64, h: 92 },
      { id: "couch", x: ox + 48, y: oy + 18, w: 76, h: 30 },
      // kitchenette runs flush along the east wall
      { id: "counter", x: ox + w - wall - 92, y: oy + 248, w: 88, h: 34 },
      { id: "desk", x: ox + 18, y: oy + 256, w: 98, h: 26 },
      // plant in the gap between the couch and the bed
      { id: "plant-1", x: ox + 128, y: oy + 18, w: 26, h: 26 },
      { id: "plant-2", x: ox + 18, y: oy + 18, w: 26, h: 26 },
      { id: "plant-3", x: ox + 158, y: oy + 18, w: 26, h: 26 },
    ],
    // scenery — drawn, but you walk over/past it. The chair has to stay
    // walk-through or it would fence you off from the mat at the desk.
    rug: { x: ox + 36, y: oy + 62, w: 200, h: 104 },
    // pushed left and turned on the diagonal, clearing the desk's right half
    // for the mat — you step up beside the chair to use the computer
    chair: { x: ox + 28, y: oy + 222, w: 24, h: 24, rot: -35 },
    open: {
      inside: {
        x0: ox + wall,
        x1: ox + w - wall,
        y0: oy + wall,
        y1: oy + h - wall,
      },
      nearGap: { x0: ox - 54, x1: ox + 36, y0: gapTop - 10, y1: gapBot + 10 },
    },
  };
})();

// center-based pad ({x,y} = center) → top-left rect, for collision/detection
export function centerRect(p: { x: number; y: number; w: number; h: number }) {
  return { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h };
}

export function padRect(d: Destination) {
  return centerRect(d.pad);
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
// Retired in the Layout C cutover; replaced by SHELLS + POIs below.
export const FILLERS: Filler[] = [];

// Plain gray shells: pure visual fill (not enterable), collidable.
export const SHELLS: {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  br: string;
}[] = [
  { x: 110, y: 60, w: 120, h: 110, rot: -2, br: "14px 6px 18px 8px" },
  { x: 900, y: 40, w: 150, h: 105, rot: 1.5, br: "8px 16px 6px 18px" },
  { x: 1050, y: 202, w: 120, h: 76, rot: -1, br: "16px 7px 12px 6px" },
  { x: 1360, y: 205, w: 130, h: 78, rot: 1.2, br: "7px 14px 9px 16px" },
  { x: 2250, y: 195, w: 120, h: 85, rot: 2, br: "12px 6px 16px 8px" },
  { x: 60, y: 175, w: 140, h: 90, rot: 1.8, br: "10px 18px 8px 14px" },
  { x: 1250, y: 420, w: 150, h: 110, rot: -1.4, br: "18px 8px 14px 6px" },
  { x: 1600, y: 390, w: 130, h: 100, rot: 1.1, br: "6px 15px 8px 12px" },
  { x: 120, y: 1080, w: 130, h: 95, rot: -1.6, br: "15px 7px 19px 9px" },
  { x: 2190, y: 1120, w: 120, h: 80, rot: 1.4, br: "8px 13px 6px 17px" },
  { x: 2000, y: 1380, w: 150, h: 105, rot: -1.2, br: "17px 8px 13px 7px" },
  { x: 1750, y: 1300, w: 120, h: 90, rot: 2.1, br: "9px 16px 7px 13px" },
  { x: 900, y: 1475, w: 160, h: 95, rot: -0.8, br: "13px 6px 18px 9px" },
];

// Bounding boxes for the solid themed POIs, so the player can't walk through them.
// (Pixel Pier gate and the Marina are intentionally omitted — arch/edge water.)
export const POI_COLLIDERS: { x: number; y: number; w: number; h: number }[] = [
  { x: 520, y: 12, w: 180, h: 96 }, // museum
  { x: 1660, y: 36, w: 170, h: 100 }, // construction
  { x: 2140, y: 30, w: 150, h: 150 }, // observatory
  { x: 40, y: 410, w: 140, h: 115 }, // arcade
  { x: 2050, y: 1150, w: 130, h: 130 }, // broadcast tower
  { x: 590, y: 1345, w: 140, h: 95 }, // ramen
  { x: 1450, y: 1402, w: 200, h: 88 }, // night market tents
];

// ---- park furniture (from the arrival prototype; positions in/around the park) ----
// trees: circular collision (x,y = CENTER, r = radius). Prototype gives top-left +
// diameter; converted here to center+radius so collision (hitsSolid) stays correct.
export const TREES: { x: number; y: number; r: number }[] = [
  { x: 945, y: 615, r: 15 },
  { x: 1072, y: 587, r: 12 },
  { x: 1424, y: 599, r: 14 },
  { x: 1501, y: 636, r: 11 },
  { x: 948, y: 788, r: 13 },
  { x: 1280, y: 730, r: 13 },
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
  { x: 1190, y: 630, w: 14, h: 56 },
  { x: 1230, y: 590, w: 56, h: 14 },
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
