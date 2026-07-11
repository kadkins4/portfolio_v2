import { describe, expect, it } from "vitest";
import { pathTo } from "./cityNav";
import { hitsSolid } from "../cityCollision";
import { SPAWN } from "../cityData";

describe("pathTo", () => {
  it("returns a waypoint list none of which sit inside a solid", () => {
    const path = pathTo({ x: SPAWN.x, y: SPAWN.y }, { x: 1200, y: 300 });
    expect(Array.isArray(path)).toBe(true);
    for (const p of path) expect(hitsSolid(p.x, p.y)).toBe(false);
  });
});
