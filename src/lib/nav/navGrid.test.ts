import { describe, expect, it } from "vitest";
import { buildGrid, findPath } from "./navGrid";

// A 200x200 world with a vertical wall at x in [90,110], y in [0,150].
// A straight line from (50,160) to (150,160) is clear underneath the wall,
// but from (50,40) to (150,40) must detour down and around the wall's bottom.
const isBlocked = (x: number, y: number) =>
  x >= 90 && x <= 110 && y >= 0 && y <= 150;

const grid = buildGrid(isBlocked, { width: 200, height: 200, cell: 10 });

describe("buildGrid", () => {
  it("marks wall cells blocked and open cells clear", () => {
    const idx = (c: number, r: number) => grid.blocked[r * grid.cols + c];
    expect(idx(10, 5)).toBe(1); // x=100,y=50 inside wall
    expect(idx(2, 2)).toBe(0); // x=20,y=20 open
  });
});

describe("findPath", () => {
  it("returns a straight shot when the line is clear", () => {
    const path = findPath(grid, { x: 50, y: 180 }, { x: 150, y: 180 });
    expect(path.length).toBeGreaterThan(0);
    // last waypoint reaches the goal cell
    const last = path[path.length - 1];
    expect(Math.hypot(last.x - 150, last.y - 180)).toBeLessThan(15);
  });

  it("routes around the wall instead of through it", () => {
    const path = findPath(grid, { x: 50, y: 40 }, { x: 150, y: 40 });
    expect(path.length).toBeGreaterThan(0);
    // no waypoint sits inside the wall
    for (const p of path) expect(isBlocked(p.x, p.y)).toBe(false);
    // the detour dips below the wall bottom (y > 150) at some point
    expect(path.some((p) => p.y > 150)).toBe(true);
  });

  it("returns empty for a fully enclosed goal", () => {
    const boxed = buildGrid(
      (x, y) =>
        x >= 30 &&
        x <= 70 &&
        y >= 30 &&
        y <= 70 &&
        !(x > 40 && x < 60 && y > 40 && y < 60),
      { width: 100, height: 100, cell: 5 }
    );
    const path = findPath(boxed, { x: 10, y: 10 }, { x: 50, y: 50 });
    expect(path).toEqual([]);
  });

  it("never ends inside a solid when the goal is tapped on a wall", () => {
    // goal (100,75) sits inside the wall; its containing cell center may sample
    // open, so this guards the pixel-accurate endpoint check specifically.
    const path = findPath(grid, { x: 50, y: 180 }, { x: 100, y: 75 });
    expect(path.length).toBeGreaterThan(0);
    for (const p of path) expect(isBlocked(p.x, p.y)).toBe(false);
    const last = path[path.length - 1];
    expect(isBlocked(last.x, last.y)).toBe(false); // stops at the wall's face
  });
});
