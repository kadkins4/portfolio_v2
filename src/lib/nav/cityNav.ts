import { WORLD } from "../cityData";
import { hitsSolid } from "../cityCollision";
import { buildGrid, findPath, type NavGrid, type Pt } from "./navGrid";

const CELL = 20; // ~half a building; balances detour smoothness vs. build cost

let grid: NavGrid | null = null;
function getGrid(): NavGrid {
  if (!grid) {
    grid = buildGrid(hitsSolid, {
      width: WORLD.w,
      height: WORLD.h,
      cell: CELL,
    });
  }
  return grid;
}

export function pathTo(start: Pt, goal: Pt): Pt[] {
  return findPath(getGrid(), start, goal);
}
