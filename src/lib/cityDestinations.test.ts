import { describe, expect, it } from "vitest";
import { DESTINATIONS, LAMPS, MARGIN, padRect, WORLD } from "./cityData";
import { hitsSolid, SOLIDS } from "./cityCollision";

describe("destination entry pads", () => {
  it("puts every pad center on walkable ground", () => {
    // A pad buried in a building or a bench can never fire its teaser.
    for (const d of DESTINATIONS) {
      expect(hitsSolid(d.pad.x, d.pad.y), `${d.key} pad center`).toBe(false);
    }
  });

  it("keeps every pad inside the world", () => {
    for (const d of DESTINATIONS) {
      const r = padRect(d);
      expect(r.x, `${d.key}`).toBeGreaterThanOrEqual(0);
      expect(r.y, `${d.key}`).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w, `${d.key}`).toBeLessThanOrEqual(WORLD.w);
      expect(r.y + r.h, `${d.key}`).toBeLessThanOrEqual(WORLD.h);
    }
  });

  it("gives every destination a unique key and href", () => {
    const keys = new Set(DESTINATIONS.map((d) => d.key));
    const hrefs = new Set(DESTINATIONS.map((d) => d.href));
    expect(keys.size).toBe(DESTINATIONS.length);
    expect(hrefs.size).toBe(DESTINATIONS.length);
  });

  it("keeps every street lamp out of a building", () => {
    // A lamp inside a footprint glows through the roof. They are street
    // furniture, so every one of them belongs on open ground.
    for (const [i, l] of LAMPS.entries()) {
      const inside = SOLIDS.find(
        (s) => l.x > s.x && l.x < s.x + s.w && l.y > s.y && l.y < s.y + s.h
      );
      expect(inside, `lamp ${i} at ${l.x},${l.y}`).toBeUndefined();
    }
  });

  it("keeps every street lamp inside the world margin", () => {
    for (const [i, l] of LAMPS.entries()) {
      expect(l.x, `lamp ${i} x`).toBeGreaterThan(MARGIN);
      expect(l.x, `lamp ${i} x`).toBeLessThan(WORLD.w - MARGIN);
      expect(l.y, `lamp ${i} y`).toBeGreaterThan(MARGIN);
      expect(l.y, `lamp ${i} y`).toBeLessThan(WORLD.h - MARGIN);
    }
  });

  it("keeps the projects stoop clear of its entry pad", () => {
    // The pavilion is entered from the right pad; the left stoop is scenery.
    const p = DESTINATIONS.find((d) => d.key === "projects")!;
    const pad = padRect(p);
    const s = p.stairs!;
    const overlaps =
      s.x < pad.x + pad.w &&
      s.x + s.w > pad.x &&
      s.y < pad.y + pad.h &&
      s.y + s.h > pad.y;
    expect(overlaps).toBe(false);
  });
});
