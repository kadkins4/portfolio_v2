export type Pt = { x: number; y: number };
export type NavGrid = {
  cell: number;
  cols: number;
  rows: number;
  blocked: Uint8Array;
  isBlocked: (x: number, y: number) => boolean;
};

export function buildGrid(
  isBlocked: (x: number, y: number) => boolean,
  opts: { width: number; height: number; cell: number }
): NavGrid {
  const { width, height, cell } = opts;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const blocked = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cell + cell / 2;
      const y = r * cell + cell / 2;
      blocked[r * cols + c] = isBlocked(x, y) ? 1 : 0;
    }
  }
  return { cell, cols, rows, blocked, isBlocked };
}

const cellCenter = (g: NavGrid, c: number, r: number): Pt => ({
  x: c * g.cell + g.cell / 2,
  y: r * g.cell + g.cell / 2,
});
const isBlockedCell = (g: NavGrid, c: number, r: number) =>
  c < 0 ||
  r < 0 ||
  c >= g.cols ||
  r >= g.rows ||
  g.blocked[r * g.cols + c] === 1;

function toCell(g: NavGrid, p: Pt) {
  return {
    c: Math.max(0, Math.min(g.cols - 1, Math.floor(p.x / g.cell))),
    r: Math.max(0, Math.min(g.rows - 1, Math.floor(p.y / g.cell))),
  };
}

/** BFS ring outward for the nearest open cell to (c0,r0). */
function nearestOpen(g: NavGrid, c0: number, r0: number) {
  if (!isBlockedCell(g, c0, r0)) return { c: c0, r: r0 };
  const seen = new Set<number>();
  const q: [number, number][] = [[c0, r0]];
  seen.add(r0 * g.cols + c0);
  while (q.length) {
    const [c, r] = q.shift()!;
    if (!isBlockedCell(g, c, r)) return { c, r };
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= g.cols || nr >= g.rows) continue;
      const k = nr * g.cols + nc;
      if (seen.has(k)) continue;
      seen.add(k);
      q.push([nc, nr]);
    }
  }
  return null;
}

const NEIGHBORS: [number, number, number][] = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
];

// Binary min-heap of (f, key) pairs for the A* open set. Replaces a linear
// scan for the min-f node, which made findPath O(n^2) over the grid. Stale
// entries (a node re-pushed with a lower f) are skipped via the closed set.
type HeapItem = { f: number; k: number };
function heapPush(heap: HeapItem[], item: HeapItem) {
  heap.push(item);
  let i = heap.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (heap[p].f <= heap[i].f) break;
    [heap[p], heap[i]] = [heap[i], heap[p]];
    i = p;
  }
}
function heapPop(heap: HeapItem[]): HeapItem | undefined {
  const top = heap[0];
  const last = heap.pop()!;
  if (heap.length > 0) {
    heap[0] = last;
    let i = 0;
    const n = heap.length;
    for (;;) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let m = i;
      if (l < n && heap[l].f < heap[m].f) m = l;
      if (r < n && heap[r].f < heap[m].f) m = r;
      if (m === i) break;
      [heap[m], heap[i]] = [heap[i], heap[m]];
      i = m;
    }
  }
  return top;
}

/** Line-of-sight between two world points: sample every ~half-cell. */
function lineClear(g: NavGrid, a: Pt, b: Pt): boolean {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const steps = Math.ceil(dist / (g.cell / 2));
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    const c = Math.floor(x / g.cell);
    const r = Math.floor(y / g.cell);
    if (isBlockedCell(g, c, r)) return false;
  }
  return true;
}

export function findPath(g: NavGrid, start: Pt, goal: Pt): Pt[] {
  const s = toCell(g, start);
  const go = nearestOpen(g, toCell(g, goal).c, toCell(g, goal).r);
  if (!go) return [];
  const startCell = nearestOpen(g, s.c, s.r);
  if (!startCell) return [];

  const idx = (c: number, r: number) => r * g.cols + c;
  const startK = idx(startCell.c, startCell.r);
  const goalK = idx(go.c, go.r);

  const gScore = new Map<number, number>([[startK, 0]]);
  const came = new Map<number, number>();
  const closed = new Set<number>();
  const h = (c: number, r: number) => {
    const dc = Math.abs(c - go.c);
    const dr = Math.abs(r - go.r);
    return dc + dr + (Math.SQRT2 - 2) * Math.min(dc, dr); // octile
  };

  const heap: HeapItem[] = [];
  heapPush(heap, { f: h(startCell.c, startCell.r), k: startK });

  while (heap.length) {
    const cur = heapPop(heap)!.k;
    if (cur === goalK) break;
    if (closed.has(cur)) continue; // stale entry, already expanded
    closed.add(cur);
    const cc = cur % g.cols;
    const cr = Math.floor(cur / g.cols);
    for (const [dc, dr, cost] of NEIGHBORS) {
      const nc = cc + dc;
      const nr = cr + dr;
      if (isBlockedCell(g, nc, nr)) continue;
      // no corner cutting: both orthogonal neighbors must be open for a diagonal
      if (dc !== 0 && dr !== 0) {
        if (isBlockedCell(g, cc + dc, cr) || isBlockedCell(g, cc, cr + dr))
          continue;
      }
      const nk = idx(nc, nr);
      if (closed.has(nk)) continue;
      const tentative = (gScore.get(cur) ?? Infinity) + cost;
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        came.set(nk, cur);
        gScore.set(nk, tentative);
        heapPush(heap, { f: tentative + h(nc, nr), k: nk });
      }
    }
  }

  if (!gScore.has(goalK) && startK !== goalK) return [];

  // reconstruct cell path
  const cells: number[] = [];
  let k: number | undefined = goalK;
  while (k !== undefined) {
    cells.push(k);
    k = came.get(k);
    if (k === startK) {
      cells.push(startK);
      break;
    }
  }
  cells.reverse();

  // to world points
  const pts = cells.map((kk) =>
    cellCenter(g, kk % g.cols, Math.floor(kk / g.cols))
  );
  // end exactly on the tapped point only if it is not inside a solid; a tap into
  // a building ends at the nearest open cell center (the last A* cell) instead.
  // Uses the real predicate, not the cell grid, so the endpoint is pixel-accurate
  // (a cell can be "open" by its center sample while its corner clips a building).
  if (!g.isBlocked(goal.x, goal.y)) pts.push(goal);

  // string-pull: drop any point reachable in a straight line from the last kept
  const pulled: Pt[] = [];
  let anchor: Pt = start;
  for (let i = 0; i < pts.length; i++) {
    const next = pts[i + 1];
    if (next && lineClear(g, anchor, next)) continue; // skip pts[i], keep pulling
    pulled.push(pts[i]);
    anchor = pts[i];
  }
  return pulled;
}
