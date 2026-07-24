import {
  CHAR_R,
  DESTINATIONS,
  SHELLS,
  POI_COLLIDERS,
  BENCHES,
  TREES,
  GALLERIA,
  POND,
  FOUNTAIN_R,
} from "./cityData";

export type Rect = { x: number; y: number; w: number; h: number };

// axis-aligned solids the player collides with (buildings, fillers, benches)
export const SOLIDS: Rect[] = [
  ...DESTINATIONS.map((d) => ({ x: d.x, y: d.y, w: d.w, h: d.h })),
  ...SHELLS.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h })),
  ...POI_COLLIDERS,
  ...BENCHES,
  // the Galleria's perimeter walls (west wall split around the entrance gap),
  // its decorative kiosk, and the courtyard fountain — same literals
  // GalleriaLayer renders from
  ...GALLERIA.walls,
  GALLERIA.kiosk,
  GALLERIA.fountain,
];

// round solids, tested by distance rather than as boxes: tree canopies and the
// park fountain's basin
export const CIRCLES: { x: number; y: number; r: number }[] = [
  ...TREES,
  { x: POND.x, y: POND.y, r: FOUNTAIN_R },
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
  for (const c of CIRCLES) {
    const dx = x - c.x;
    const dy = y - c.y;
    if (dx * dx + dy * dy < (c.r + CHAR_R) * (c.r + CHAR_R)) return true;
  }
  return false;
}
