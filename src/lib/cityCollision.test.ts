import { describe, expect, it } from "vitest";
import { hitsSolid, SOLIDS } from "./cityCollision";
import {
  SPAWN,
  WORLD,
  GALLERIA,
  APARTMENT,
  TERMINAL,
  DESTINATIONS,
  CHAR_R,
  TREES,
  BENCHES,
  POND,
  FOUNTAIN_R,
  centerRect,
} from "./cityData";

describe("hitsSolid", () => {
  it("reports a collision at the center of the first solid", () => {
    const s = SOLIDS[0];
    expect(hitsSolid(s.x + s.w / 2, s.y + s.h / 2)).toBe(true);
  });

  it("reports open space far outside every solid", () => {
    // top-left margin corner is street, not a building
    expect(hitsSolid(30, 30)).toBe(false);
  });

  it("leaves the spawn point walkable", () => {
    // The arrival landing sits at the foot of the terminal stairs, in the lane
    // between the ADKINS LINE building and the ticket hall. Anything placed
    // here traps the player before they ever take a step.
    expect(hitsSolid(SPAWN.x, SPAWN.y)).toBe(false);
  });

  it("keeps every solid inside the world bounds", () => {
    // Catches an east-edge building left behind after a world resize.
    for (const s of SOLIDS) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.x + s.w).toBeLessThanOrEqual(WORLD.w);
      expect(s.y + s.h).toBeLessThanOrEqual(WORLD.h);
    }
  });
});

describe("terminal station", () => {
  const T = TERMINAL;
  const resume = DESTINATIONS.find((d) => d.key === "resume")!;

  it("puts the platform on the west side of the track", () => {
    // the whole point of the flip: you step off facing the ADKINS LINE
    // building, not away from it
    expect(T.platform.x + T.platform.w).toBeLessThanOrEqual(T.railX);
    expect(resume.x).toBeLessThan(T.platform.x);
  });

  const laneX = T.platform.x + T.platform.w / 2;
  const gapMid = (T.gap.top + T.gap.bot) / 2;

  it("leaves the ramp and the deck lane walkable", () => {
    // you arrive on these; a solid on either strands the player on the deck
    expect(hitsSolid(T.ramp.x + T.ramp.w / 2, gapMid)).toBe(false);
    expect(hitsSolid(laneX, T.platform.y + T.platform.h / 2)).toBe(false);
  });

  it("fences the deck on every side but the ramp mouth", () => {
    // walk into each railing from the deck side and you stop
    const inset = T.rail + CHAR_R - 1;
    expect(hitsSolid(laneX, T.platform.y + inset), "north end").toBe(true);
    expect(
      hitsSolid(laneX, T.platform.y + T.platform.h - inset),
      "south end"
    ).toBe(true);
    expect(
      hitsSolid(T.platform.x + T.platform.w - inset, gapMid),
      "trackside"
    ).toBe(true);
    // the west railing, above and below the ramp
    expect(hitsSolid(T.platform.x + inset, T.gap.top - 40), "west upper").toBe(
      true
    );
    expect(hitsSolid(T.platform.x + inset, T.gap.bot + 40), "west lower").toBe(
      true
    );
  });

  it("makes the ramp mouth the only way on or off the deck", () => {
    // sample the whole west edge: the only walkable stretch is the gap
    const edgeX = T.platform.x + T.rail + CHAR_R - 1;
    for (let y = T.platform.y; y < T.platform.y + T.platform.h; y += 4) {
      const open = !hitsSolid(edgeX, y);
      const inGap = y > T.gap.top && y < T.gap.bot;
      if (open) expect(inGap, `west edge open at y=${y}`).toBe(true);
    }
  });

  it("funnels the ramp mouth between the turnstiles", () => {
    // the stiles are solid, the lane between them is not
    for (const [i, s] of T.turnstiles.entries()) {
      expect(hitsSolid(s.x + s.w / 2, s.y + s.h / 2), `stile ${i}`).toBe(true);
    }
    expect(hitsSolid(T.turnstiles[0].x + T.turnstiles[0].w / 2, gapMid)).toBe(
      false
    );
  });

  it("leaves the turnstile lane wider than the player", () => {
    // a gap exactly a body wide is a gap nobody can find
    const lane = T.turnstiles[1].y - (T.turnstiles[0].y + T.turnstiles[0].h);
    expect(lane).toBeGreaterThan(CHAR_R * 2 + 8);
  });

  it("seals the slot between the station and the platform", () => {
    // the deck's west edge butts against the building, so there is no alley to
    // squeeze up between the two
    expect(T.platform.x).toBe(resume.x + resume.w);
    const slotY = Math.max(T.platform.y, resume.y) + 20;
    expect(hitsSolid(resume.x + resume.w, slotY)).toBe(true);
  });

  it("lands the player level with the resume pad", () => {
    // a straight walk west, not a detour around the building. The landing is
    // squared up with the gate rather than pinned to the pad's exact centre, so
    // allow anywhere within the pad's own span.
    const pad = centerRect(resume.pad);
    expect(SPAWN.y).toBeGreaterThan(pad.y);
    expect(SPAWN.y).toBeLessThan(pad.y + pad.h);
  });

  it("squares the landing up with the middle of the gate", () => {
    expect(SPAWN.y).toBe((T.gap.top + T.gap.bot) / 2);
  });

  it("leaves a clear straightaway from the landing to the resume pad", () => {
    // sampled every 6px — the ticket hall or the building overhanging this lane
    // would make the arrival read as a dead end
    const steps = Math.ceil((SPAWN.x - resume.pad.x) / 6);
    for (let i = 0; i <= steps; i++) {
      const x = SPAWN.x + ((resume.pad.x - SPAWN.x) * i) / steps;
      expect(hitsSolid(x, SPAWN.y), `blocked at ${Math.round(x)}`).toBe(false);
    }
  });

  it("leaves the deck lane wide enough to walk", () => {
    // rails eat into a corridor that is already narrow; if the clear span drops
    // under a body width the deck stops being somewhere you can stand
    const clear = T.platform.w - T.rail * 2;
    expect(clear).toBeGreaterThan(CHAR_R * 2);
  });
});

describe("park greenery", () => {
  it("makes every tree solid at its center", () => {
    for (const [i, t] of TREES.entries()) {
      expect(hitsSolid(t.x, t.y), `tree ${i}`).toBe(true);
    }
  });

  it("makes every tree solid at its edge", () => {
    // the player's own radius counts, so contact happens before the trunk
    for (const [i, t] of TREES.entries()) {
      expect(hitsSolid(t.x + t.r, t.y), `tree ${i} east edge`).toBe(true);
      expect(hitsSolid(t.x, t.y - t.r), `tree ${i} north edge`).toBe(true);
    }
  });

  it("leaves ground just beyond a tree walkable", () => {
    const t = TREES[0];
    expect(hitsSolid(t.x + t.r + CHAR_R + 4, t.y)).toBe(false);
  });

  it("makes every bench solid across its whole span", () => {
    // benches are thin; sample the middle and both ends so a mis-sized rect
    // (w/h swapped on a new one) can't slip through
    for (const [i, b] of BENCHES.entries()) {
      expect(hitsSolid(b.x + b.w / 2, b.y + b.h / 2), `bench ${i} mid`).toBe(
        true
      );
      expect(hitsSolid(b.x + 1, b.y + 1), `bench ${i} start`).toBe(true);
      expect(hitsSolid(b.x + b.w - 1, b.y + b.h - 1), `bench ${i} end`).toBe(
        true
      );
    }
  });

  it("keeps every bench thin enough to never be stepped over", () => {
    // the loop moves at most `speed * dtCap` = 4 * 3 = 12px per frame, and the
    // test band around a solid is its size + CHAR_R on both sides. Anything
    // over 12px of clearance cannot be tunnelled through.
    const MAX_STEP = 12;
    for (const [i, b] of BENCHES.entries()) {
      expect(Math.min(b.w, b.h) + CHAR_R * 2, `bench ${i}`).toBeGreaterThan(
        MAX_STEP
      );
    }
    for (const [i, t] of TREES.entries()) {
      expect((t.r + CHAR_R) * 2, `tree ${i}`).toBeGreaterThan(MAX_STEP);
    }
  });
});

describe("park fountain", () => {
  it("blocks the fountain basin", () => {
    expect(hitsSolid(POND.x, POND.y)).toBe(true);
  });

  it("blocks the basin rim", () => {
    expect(hitsSolid(POND.x + FOUNTAIN_R, POND.y)).toBe(true);
    expect(hitsSolid(POND.x, POND.y + FOUNTAIN_R)).toBe(true);
  });

  it("leaves the pond water around it walkable", () => {
    // the fountain is solid, the pond it sits in is not — you can circle it.
    // (east side: a bench sits across the north rim.)
    expect(hitsSolid(POND.x + POND.r - 4, POND.y)).toBe(false);
  });
});

describe("Unit 4B apartment", () => {
  const A = APARTMENT;
  const about = DESTINATIONS.find((d) => d.key === "about")!;

  it("blocks the west wall above and below the doorway", () => {
    expect(hitsSolid(A.x + 4, A.gap.top - 40)).toBe(true);
    expect(hitsSolid(A.x + 4, A.gap.bot + 40)).toBe(true);
  });

  it("leaves the doorway walkable", () => {
    expect(hitsSolid(A.x + 4, (A.gap.top + A.gap.bot) / 2)).toBe(false);
  });

  it("keeps the doorway at least a player-width clear", () => {
    expect(A.gap.bot - A.gap.top).toBeGreaterThanOrEqual(CHAR_R * 2);
  });

  it("blocks the north, south, and east walls", () => {
    const cx = A.x + A.w / 2;
    expect(hitsSolid(cx, A.y + 4)).toBe(true);
    expect(hitsSolid(cx, A.y + A.h - 4)).toBe(true);
    expect(hitsSolid(A.x + A.w - 4, A.y + A.h / 2)).toBe(true);
  });

  it("makes every furnishing solid", () => {
    for (const f of A.furniture) {
      expect(hitsSolid(f.x + f.w / 2, f.y + f.h / 2), f.id).toBe(true);
    }
  });

  it("puts the mat inside the apartment, on open floor", () => {
    // the whole point: you walk in to reach it, and standing there works
    expect(about.pad.x).toBeGreaterThan(A.open.inside.x0);
    expect(about.pad.x).toBeLessThan(A.open.inside.x1);
    expect(about.pad.y).toBeGreaterThan(A.open.inside.y0);
    expect(about.pad.y).toBeLessThan(A.open.inside.y1);
    expect(hitsSolid(about.pad.x, about.pad.y)).toBe(false);
  });

  it("leaves a walkable route from the doorway to the mat", () => {
    // step in, then walk the lane to the desk — sampled every 6px
    const start = {
      x: A.x + A.wall + CHAR_R + 1,
      y: (A.gap.top + A.gap.bot) / 2,
    };
    const end = { x: about.pad.x, y: about.pad.y };
    const legs = [
      [start, { x: start.x, y: end.y }],
      [{ x: start.x, y: end.y }, end],
    ] as const;
    for (const [a, b] of legs) {
      const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 6);
      for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        expect(
          hitsSolid(x, y),
          `blocked at ${Math.round(x)},${Math.round(y)}`
        ).toBe(false);
      }
    }
  });

  it("keeps the mat parked against the desk", () => {
    // the mat is meant to read as "standing at the computer". Move the desk
    // without moving the mat and this fails — which is exactly what happened
    // once already.
    const desk = A.furniture.find((f) => f.id === "desk")!;
    const mat = centerRect(about.pad);
    // sits on the desk's north edge — a few px of hand-tuned breathing room is
    // fine, being nowhere near it (or on top of it) is not
    const gap = desk.y - (mat.y + mat.h);
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThanOrEqual(12);
    expect(mat.x).toBeGreaterThanOrEqual(desk.x);
    expect(mat.x + mat.w).toBeLessThanOrEqual(desk.x + desk.w);
  });

  it("leaves standing room on the mat", () => {
    // flush is good, unreachable is not: the player's body must fit somewhere
    // inside the mat without clipping the desk
    const mat = centerRect(about.pad);
    const spots = [];
    for (let y = mat.y; y <= mat.y + mat.h; y += 2) {
      if (!hitsSolid(about.pad.x, y)) spots.push(y);
    }
    expect(spots.length, "walkable rows inside the mat").toBeGreaterThan(4);
  });

  it("no longer treats the whole footprint as solid", () => {
    // the middle of the room used to be a wall; now it is a room
    expect(hitsSolid(A.x + A.w / 2, A.y + A.h / 2)).toBe(false);
  });
});

describe("Galleria mall", () => {
  const { x, gap } = GALLERIA;

  it("blocks the west wall above and below the entrance", () => {
    // just inside the wall line, north of the gap and south of it
    expect(hitsSolid(x + 4, gap.top - 40)).toBe(true);
    expect(hitsSolid(x + 4, gap.bot + 40)).toBe(true);
  });

  it("leaves the entrance gap walkable", () => {
    const midY = (gap.top + gap.bot) / 2;
    // standing in the doorway, on the wall line — should be clear
    expect(hitsSolid(x + 4, midY)).toBe(false);
  });

  it("keeps the entrance gap at least a player-width clear", () => {
    // the gap must admit the player (radius 13 → 26px min); it is 90px here
    expect(gap.bot - gap.top).toBeGreaterThanOrEqual(CHAR_R * 2);
  });

  it("blocks the north, south, and east walls", () => {
    const cx = x + GALLERIA.w / 2;
    expect(hitsSolid(cx, GALLERIA.y + 4)).toBe(true); // north
    expect(hitsSolid(cx, GALLERIA.y + GALLERIA.h - 4)).toBe(true); // south
    expect(hitsSolid(x + GALLERIA.w - 4, GALLERIA.y + GALLERIA.h / 2)).toBe(
      true
    ); // east
  });

  it("leaves an open courtyard lane walkable", () => {
    // between the west units and the fountain — clear of every solid
    expect(hitsSolid(2700, 800)).toBe(false);
  });
});
