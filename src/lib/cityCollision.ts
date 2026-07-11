import {
  CHAR_R,
  DESTINATIONS,
  SHELLS,
  POI_COLLIDERS,
  BENCHES,
  TREES,
} from "./cityData";

export type Rect = { x: number; y: number; w: number; h: number };

// axis-aligned solids the player collides with (buildings, fillers, benches)
export const SOLIDS: Rect[] = [
  ...DESTINATIONS.map((d) => ({ x: d.x, y: d.y, w: d.w, h: d.h })),
  ...SHELLS.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h })),
  ...POI_COLLIDERS,
  ...BENCHES,
];

export function hitsSolid(x: number, y: number): boolean {
  for (const s of SOLIDS) {
    if (
      x + CHAR_R > s.x &&
      x - CHAR_R < s.x + s.w &&
      y + CHAR_R > s.y &&
      y - CHAR_R < s.y + s.h
    )
      return true;
  }
  for (const t of TREES) {
    const dx = x - t.x;
    const dy = y - t.y;
    if (dx * dx + dy * dy < (t.r + CHAR_R) * (t.r + CHAR_R)) return true;
  }
  return false;
}
