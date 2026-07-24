import { describe, expect, it } from "vitest";
import { hitsSolid, SOLIDS } from "./cityCollision";
import { SPAWN, WORLD, GALLERIA, CHAR_R } from "./cityData";

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
    // The arrival landing sits in a narrow corridor between the rail platform
    // and the Projects pavilion. Anything placed here traps the player.
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
