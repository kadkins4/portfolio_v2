// The Galleria's 14 storefront slots. Slots are fixed geometry; occupancy is
// derived from the project list, so the mall self-balances: publishing a
// project fills a vacant slot with no code change, and vacancy is just the
// absence of a project (there is no "for lease" status).
import { GALLERIA } from "./cityData";

/** @public — field type of UnitSlot/GalleriaUnit; exported for consumers. */
export type UnitFace = "N" | "S" | "E" | "W";

export type UnitSlot = {
  code: string; // directory code, e.g. "N-01" (shown in the teaser + on con units)
  rx: number; // mall-relative top-left
  ry: number;
  w: number;
  h: number;
  face: UnitFace; // which side the entrance pad (door) sits on
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

/** @public — field type of GalleriaUnit; exported for consumers. */
export type PadRect = { x: number; y: number; w: number; h: number };

/** @public — field type of GalleriaUnit; exported for consumers. */
export type UnitTeaser = {
  kicker: string;
  title: string;
  blurb: string;
  cta: string;
};

export type GalleriaUnit = {
  id: string;
  code: string;
  rect: PadRect; // world-space storefront box
  face: UnitFace;
  anchor: boolean;
  hue: number;
  state: "live" | "in-progress" | "vacant";
  // present only when occupied:
  slug?: string;
  name?: string; // storefront sign text
  permit?: string; // permit-board text (in-progress units)
  href?: string;
  pad?: PadRect; // world-space, center-based (matches Destination.pad)
  teaser?: UnitTeaser;
};

// Fourteen storefronts ring the courtyard, each backed flush to an outer wall
// with its door facing in — the mockup's floor plan. Two 132px-wide anchor
// slots (N-01, S-04) sit diagonally across from each other. Array order is the
// fill priority: anchors first, then west-to-east so any vacancy lands on the
// back (east) wall rather than by the entrance.
export const SLOTS: UnitSlot[] = [
  // anchors — the two wide end-cap slots
  { code: "N-01", rx: 36, ry: 22, w: 132, h: 64, face: "S", anchor: true },
  { code: "S-04", rx: 340, ry: 534, w: 132, h: 64, face: "N", anchor: true },
  // west wall, facing east (either side of the entrance gap)
  { code: "W-01", rx: 22, ry: 110, w: 64, h: 80, face: "E" },
  // north wall, facing south
  { code: "N-02", rx: 188, ry: 22, w: 88, h: 64, face: "S" },
  // south wall, facing north
  { code: "S-01", rx: 36, ry: 534, w: 88, h: 64, face: "N" },
  { code: "N-03", rx: 288, ry: 22, w: 88, h: 64, face: "S" },
  { code: "S-02", rx: 136, ry: 534, w: 88, h: 64, face: "N" },
  { code: "W-02", rx: 22, ry: 400, w: 64, h: 80, face: "E" },
  { code: "N-04", rx: 388, ry: 22, w: 88, h: 64, face: "S" },
  { code: "S-03", rx: 236, ry: 534, w: 88, h: 64, face: "N" },
  // east wall, facing west — fills last, so the back wall carries the vacancies
  { code: "E-01", rx: 440, ry: 110, w: 64, h: 80, face: "W" },
  { code: "E-02", rx: 440, ry: 210, w: 64, h: 80, face: "W" },
  { code: "E-03", rx: 440, ry: 310, w: 64, h: 80, face: "W" },
  { code: "E-04", rx: 440, ry: 420, w: 64, h: 80, face: "W" },
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

function teaserFor(p: CityProject, code: string): UnitTeaser {
  const building = p.status === "in-progress";
  const tail = building ? "PERMIT POSTED" : p.districtLabel.toUpperCase();
  return {
    kicker: `✦ THE GALLERIA · UNIT ${code} · ${tail}`,
    title: `${p.title}.`,
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
        code: slot.code,
        rect,
        face: slot.face,
        anchor: !!slot.anchor,
        hue: 300, // neutral lavender for vacancy
        state: "vacant" as const,
      };
    }
    return {
      id,
      code: slot.code,
      rect,
      face: slot.face,
      anchor: !!slot.anchor,
      hue: p.hue,
      state: p.status,
      slug: p.slug,
      name: p.title,
      permit:
        p.status === "in-progress"
          ? `${slot.code} · ${p.title.toUpperCase()}`
          : undefined,
      href: `/projects/${p.slug}`,
      pad: worldPad(slot),
      teaser: teaserFor(p, slot.code),
    };
  });
}
