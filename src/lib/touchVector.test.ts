import { describe, expect, it } from "vitest";
import { computeStick } from "./touchVector";

describe("computeStick", () => {
  it("returns zero at the center", () => {
    expect(computeStick(0, 0, 50)).toEqual({ x: 0, y: 0, mag: 0 });
  });

  it("clamps magnitude to 1 beyond the radius", () => {
    const r = computeStick(100, 0, 50); // pushed twice past the edge, straight right
    expect(r.mag).toBeCloseTo(1, 5);
    expect(r.x).toBeCloseTo(1, 5);
    expect(r.y).toBeCloseTo(0, 5);
  });

  it("scales magnitude linearly inside the radius", () => {
    const r = computeStick(0, 25, 50); // half-deflection, straight down (screen +y)
    expect(r.mag).toBeCloseTo(0.5, 5);
    expect(r.x).toBeCloseTo(0, 5);
    expect(r.y).toBeCloseTo(0.5, 5);
  });

  it("preserves diagonal direction", () => {
    const r = computeStick(30, 40, 50); // 3-4-5 triangle, magnitude 50 == radius
    expect(r.mag).toBeCloseTo(1, 5);
    expect(r.x).toBeCloseTo(0.6, 5);
    expect(r.y).toBeCloseTo(0.8, 5);
  });
});
