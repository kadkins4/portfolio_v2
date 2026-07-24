// The Galleria's 14 storefront slots. Slots are fixed geometry; occupancy is
// derived from the project list, so the mall self-balances: publishing a
// project fills a vacant slot with no code change, and vacancy is just the
// absence of a project (there is no "for lease" status).
import { GALLERIA } from "./cityData";

export type UnitFace = "N" | "S" | "E" | "W";

export type UnitSlot = {
  rx: number; // mall-relative top-left
  ry: number;
  w: number;
  h: number;
  face: UnitFace; // which side the entrance pad sits on
  anchor?: boolean; // the two largest slots take the first two projects
};

// Serializable project shape the city needs (built server-side in city/page).
export type CityProject = {
  slug: string;
  title: string;
  description: string;
  cityBlurb: string | null;
  status: "live" | "in-progress";
  hue: number;
  districtLabel: string;
};

export type PadRect = { x: number; y: number; w: number; h: number };

export type UnitTeaser = {
  kicker: string;
  title: string;
  blurb: string;
  cta: string;
};

export type GalleriaUnit = {
  id: string;
  rect: PadRect; // world-space storefront box
  face: UnitFace;
  anchor: boolean;
  hue: number;
  state: "live" | "in-progress" | "vacant";
  // present only when occupied:
  slug?: string;
  href?: string;
  pad?: PadRect; // world-space, center-based (matches Destination.pad)
  teaser?: UnitTeaser;
};

// Two anchors flank the west entrance wall (facing the concourse); the long
// north and south walls carry the standard storefronts; two more line the
// east wall. Fourteen in all — comfortably more than today's project count so
// the mall grows into itself.
export const SLOTS: UnitSlot[] = [
  // anchors — west wall, above and below the entrance gap, facing east
  { rx: 24, ry: 60, w: 104, h: 150, face: "E", anchor: true },
  { rx: 24, ry: 420, w: 104, h: 150, face: "E", anchor: true },
  // north wall, facing south into the concourse
  { rx: 166, ry: 20, w: 56, h: 78, face: "S" },
  { rx: 230, ry: 20, w: 56, h: 78, face: "S" },
  { rx: 294, ry: 20, w: 56, h: 78, face: "S" },
  { rx: 358, ry: 20, w: 56, h: 78, face: "S" },
  { rx: 422, ry: 20, w: 56, h: 78, face: "S" },
  // south wall, facing north
  { rx: 166, ry: 370, w: 56, h: 78, face: "N" },
  { rx: 230, ry: 370, w: 56, h: 78, face: "N" },
  { rx: 294, ry: 370, w: 56, h: 78, face: "N" },
  { rx: 358, ry: 370, w: 56, h: 78, face: "N" },
  { rx: 422, ry: 370, w: 56, h: 78, face: "N" },
  // east wall, facing west
  { rx: 436, ry: 176, w: 64, h: 84, face: "W" },
  { rx: 436, ry: 288, w: 64, h: 84, face: "W" },
];

// world-space entrance pad for a slot (center-based, like Destination.pad)
function worldPad(s: UnitSlot): PadRect {
  const ox = GALLERIA.x;
  const oy = GALLERIA.y;
  switch (s.face) {
    case "S":
      return { x: ox + s.rx + s.w / 2, y: oy + s.ry + s.h + 20, w: 48, h: 30 };
    case "N":
      return { x: ox + s.rx + s.w / 2, y: oy + s.ry - 20, w: 48, h: 30 };
    case "W":
      return { x: ox + s.rx - 22, y: oy + s.ry + s.h / 2, w: 34, h: 48 };
    case "E":
      return { x: ox + s.rx + s.w + 22, y: oy + s.ry + s.h / 2, w: 34, h: 48 };
  }
}

function teaserFor(p: CityProject): UnitTeaser {
  const building = p.status === "in-progress";
  return {
    kicker: `✦ THE GALLERIA · ${p.districtLabel.toUpperCase()}`,
    title: p.title,
    blurb: p.cityBlurb ?? p.description,
    cta: building ? "> peek at the build" : "> step inside",
  };
}

// Assigns projects to slots: anchors first (the two largest slots), then the
// rest in order. Any slot past the project count renders FOR LEASE.
export function buildGalleriaUnits(projects: CityProject[]): GalleriaUnit[] {
  const ox = GALLERIA.x;
  const oy = GALLERIA.y;
  // fill order: both anchors, then the remaining slots as authored
  const anchors = SLOTS.filter((s) => s.anchor);
  const rest = SLOTS.filter((s) => !s.anchor);
  const fillOrder = [...anchors, ...rest];

  return fillOrder.map((slot, i) => {
    const p = projects[i] ?? null;
    const rect: PadRect = {
      x: ox + slot.rx,
      y: oy + slot.ry,
      w: slot.w,
      h: slot.h,
    };
    const id = `unit${SLOTS.indexOf(slot)}`;
    if (!p) {
      return {
        id,
        rect,
        face: slot.face,
        anchor: !!slot.anchor,
        hue: 300, // neutral lavender for vacancy
        state: "vacant" as const,
      };
    }
    return {
      id,
      rect,
      face: slot.face,
      anchor: !!slot.anchor,
      hue: p.hue,
      state: p.status,
      slug: p.slug,
      href: `/projects/${p.slug}`,
      pad: worldPad(slot),
      teaser: teaserFor(p),
    };
  });
}
