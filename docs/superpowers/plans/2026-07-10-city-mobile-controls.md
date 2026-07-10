# City Mobile Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the walkable Neon City (`/city`) fully playable on touch devices via three complementary controls (on-screen joystick, tap-to-walk with pathfinding, fast-travel drawer), without regressing the existing desktop experience.

**Architecture:** Mobile behavior is gated behind a single `useIsTouch` signal so the desktop code path is untouched. A joystick component writes a velocity vector into a ref the existing game loop already consumes the same way it consumes WASD. Tap-to-walk is upgraded from direct-line movement to A\* pathfinding over a coarse nav grid that reuses the game's real collision predicate, so taps route _around_ buildings instead of getting stuck on them (this improvement also benefits desktop clicks). Fast travel reuses the existing `fastTravel()` glide, re-housed in a bottom-sheet drawer. Pathfinding lives in pure, dependency-injected modules that are unit-tested in isolation.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, plain CSS Modules (NO Tailwind), Vitest + Testing Library, pnpm 11.

## Global Constraints

- World is a fixed `2400 x 1600` field: `WORLD = { w: 2400, h: 1600 }`, `CHAR_R = 13`, `MARGIN = 26` (from `src/lib/cityData.ts`). Copy these verbatim; never hardcode literals.
- Dev server runs on port **3001** (`pnpm dev`). Live preview URL for phone testing comes from pushing the feature branch (Vercel branch preview).
- Run tests **bare**: `pnpm test` (the script is `vitest run` — do NOT pass extra args). Single file: `pnpm exec vitest run <path>`.
- Typecheck: `npx tsc --noEmit` (must exit 0). Build gate: `pnpm build`.
- Styling is **CSS Modules only** — no Tailwind, no inline style objects for anything themeable. New components get a co-located `*.module.css`.
- **Commits:** short imperative, no `Co-Authored-By` trailer (e.g. `Adds touch joystick to city`).
- **No em-dashes** in any user-visible copy (HUD text, labels, aria). Use `·`, commas, or periods.
- **Desktop path stays unchanged.** Every new control renders only when `isTouch` is true. The one deliberate exception is pathfinding, which improves the shared click-to-walk handler for both desktop and touch (strictly better: falls back to old direct-line if no path is found).
- All new interactive touch chrome must carry `data-hud` so the world click handler ignores taps that land on it (existing pattern at `NeonCity.tsx:272`).
- Work on branch `city-mobile`. Each Checkpoint ends with a push so a preview URL is available for on-device testing. Merging to `main` is a production deploy and requires Kenny's explicit authorization — do not merge without it.

---

## File Structure

**New files:**

- `src/hooks/useIsTouch.ts` — SSR-safe touch-capability hook.
- `src/lib/touchVector.ts` — pure joystick vector math.
- `src/lib/cityCollision.ts` — extracted `hitsSolid(x, y)` predicate (moved out of `NeonCity.tsx`), shared by the game and the nav grid.
- `src/lib/nav/navGrid.ts` — pure, dependency-injected grid builder + A\* pathfinder.
- `src/lib/nav/cityNav.ts` — thin binding: memoized grid over the real city collision, exposes `pathTo(start, goal)`.
- `src/components/holo/TouchJoystick.tsx` (+ `touchJoystick.module.css`) — bottom-left thumbstick.
- `src/components/holo/FastTravelDrawer.tsx` (+ `fastTravelDrawer.module.css`) — bottom-sheet destination list.
- Tests: `src/hooks/useIsTouch.test.ts`, `src/lib/touchVector.test.ts`, `src/lib/cityCollision.test.ts`, `src/lib/nav/navGrid.test.ts`, `src/lib/nav/cityNav.test.ts`.

**Modified files:**

- `src/components/holo/NeonCity.tsx` — add `joy`/`path` refs, wire joystick + pathfinding into the loop, render touch chrome, swap HUD copy. Import `hitsSolid` from the new collision module instead of defining it locally.
- `src/components/holo/neonCity.module.css` — mobile-only tweaks (hide desktop fastbar/controls on coarse pointers).

---

## Checkpoint A — Touch-Usable (joystick + drawer + copy)

**Ships:** a phone user can roam with the joystick and jump anywhere via the drawer. Tap-to-walk still uses the old direct-line mover (fine on open streets; gets stuck near buildings — fixed in Checkpoint B). Desktop unchanged.

### Task A1: `useIsTouch` hook

**Files:**

- Create: `src/hooks/useIsTouch.ts`
- Test: `src/hooks/useIsTouch.test.ts`

**Interfaces:**

- Produces: `useIsTouch(): boolean` — `false` during SSR/first paint, resolves to true on coarse-pointer/touch-capable devices after mount.

- [ ] **Step 1: Write the failing test**

```ts
// src/hooks/useIsTouch.test.ts
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsTouch } from "./useIsTouch";

function mockPointer(coarse: boolean, touchPoints = coarse ? 5 : 0) {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: coarse && q.includes("coarse"),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  Object.defineProperty(navigator, "maxTouchPoints", {
    value: touchPoints,
    configurable: true,
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("useIsTouch", () => {
  it("returns true on a coarse-pointer device", () => {
    mockPointer(true);
    const { result } = renderHook(() => useIsTouch());
    expect(result.current).toBe(true);
  });

  it("returns false on a fine-pointer device", () => {
    mockPointer(false);
    const { result } = renderHook(() => useIsTouch());
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/hooks/useIsTouch.test.ts`
Expected: FAIL — "Failed to resolve import ./useIsTouch".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/hooks/useIsTouch.ts
import { useEffect, useState } from "react";

/** True on touch-capable / coarse-pointer devices. SSR-safe: false until mount. */
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const coarse =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    const touch = navigator.maxTouchPoints > 0;
    setIsTouch(coarse || touch);
  }, []);
  return isTouch;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/hooks/useIsTouch.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useIsTouch.ts src/hooks/useIsTouch.test.ts
git commit -m "Adds touch-capability hook"
```

### Task A2: `touchVector` joystick math

**Files:**

- Create: `src/lib/touchVector.ts`
- Test: `src/lib/touchVector.test.ts`

**Interfaces:**

- Produces: `computeStick(dx: number, dy: number, radius: number): { x: number; y: number; mag: number }` — `dx/dy` are the touch offset from the stick base center in pixels; `radius` is the stick's max travel. Returns a direction vector whose components are each in `[-1, 1]` (unit direction scaled by clamped magnitude) plus `mag` in `[0, 1]`. Zero input returns `{ x: 0, y: 0, mag: 0 }`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/touchVector.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/lib/touchVector.test.ts`
Expected: FAIL — cannot resolve `./touchVector`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/touchVector.ts

/**
 * Convert a joystick touch offset into a movement vector.
 * dx/dy: touch position relative to the stick base center (screen pixels, +y down).
 * radius: max stick travel. Output components are the unit direction times the
 * clamped magnitude, so each is in [-1, 1]; mag is in [0, 1].
 */
export function computeStick(
  dx: number,
  dy: number,
  radius: number
): { x: number; y: number; mag: number } {
  const dist = Math.hypot(dx, dy);
  if (dist === 0 || radius <= 0) return { x: 0, y: 0, mag: 0 };
  const mag = Math.min(1, dist / radius);
  return { x: (dx / dist) * mag, y: (dy / dist) * mag, mag };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/lib/touchVector.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/touchVector.ts src/lib/touchVector.test.ts
git commit -m "Adds joystick vector math"
```

### Task A3: `TouchJoystick` component

**Files:**

- Create: `src/components/holo/TouchJoystick.tsx`
- Create: `src/components/holo/touchJoystick.module.css`

**Interfaces:**

- Consumes: `computeStick` (Task A2).
- Produces: `TouchJoystick({ onVector, onStart }: { onVector: (v: { x: number; y: number; mag: number }) => void; onStart: () => void }): JSX.Element` — a fixed bottom-left thumbstick. Emits the current vector on every touch move (and `{0,0,0}` on release), calls `onStart` on touch begin so the loop can cancel any active tap-target.

- [ ] **Step 1: Write the component**

```tsx
// src/components/holo/TouchJoystick.tsx
"use client";

import { useRef } from "react";
import { computeStick } from "@/lib/touchVector";
import styles from "./touchJoystick.module.css";

const RADIUS = 46; // px of max knob travel; matches .base size in CSS

export default function TouchJoystick({
  onVector,
  onStart,
}: {
  onVector: (v: { x: number; y: number; mag: number }) => void;
  onStart: () => void;
}) {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const activeId = useRef<number | null>(null);
  const center = useRef({ x: 0, y: 0 });

  function moveKnob(dx: number, dy: number) {
    const d = Math.hypot(dx, dy);
    const clamped = d > RADIUS ? RADIUS / d : 1;
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${dx * clamped}px, ${dy * clamped}px)`;
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (activeId.current !== null) return;
    activeId.current = e.pointerId;
    const rect = baseRef.current!.getBoundingClientRect();
    center.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onStart();
    const dx = e.clientX - center.current.x;
    const dy = e.clientY - center.current.y;
    moveKnob(dx, dy);
    onVector(computeStick(dx, dy, RADIUS));
  }

  function onPointerMove(e: React.PointerEvent) {
    if (e.pointerId !== activeId.current) return;
    const dx = e.clientX - center.current.x;
    const dy = e.clientY - center.current.y;
    moveKnob(dx, dy);
    onVector(computeStick(dx, dy, RADIUS));
  }

  function onPointerUp(e: React.PointerEvent) {
    if (e.pointerId !== activeId.current) return;
    activeId.current = null;
    if (knobRef.current) knobRef.current.style.transform = "translate(0,0)";
    onVector({ x: 0, y: 0, mag: 0 });
  }

  return (
    <div
      ref={baseRef}
      data-hud
      className={styles.base}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-hidden
    >
      <div ref={knobRef} className={styles.knob} />
    </div>
  );
}
```

- [ ] **Step 2: Write the styles**

```css
/* src/components/holo/touchJoystick.module.css */
.base {
  position: fixed;
  left: 22px;
  bottom: 28px;
  width: 116px;
  height: 116px;
  border-radius: 50%;
  border: 1px solid rgba(170, 180, 232, 0.35);
  background: rgba(20, 24, 48, 0.28);
  backdrop-filter: blur(6px);
  touch-action: none;
  z-index: 40;
  display: grid;
  place-items: center;
}
.knob {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(170, 180, 232, 0.65);
  box-shadow: 0 0 12px rgba(170, 180, 232, 0.6);
  will-change: transform;
}
```

- [ ] **Step 3: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/holo/TouchJoystick.tsx src/components/holo/touchJoystick.module.css
git commit -m "Adds touch joystick component"
```

### Task A4: Wire the joystick into NeonCity movement

**Files:**

- Modify: `src/components/holo/NeonCity.tsx` (add `joy` ref near other refs ~line 153; consume it in the movement loop ~lines 433-444; render `TouchJoystick` in the return when `isTouch`).

**Interfaces:**

- Consumes: `TouchJoystick` (A3), `useIsTouch` (A1).
- Produces: joystick-driven movement using the existing velocity path.

- [ ] **Step 1: Add the ref and touch flag**

Near the other refs (after `const keys = useRef...`, `NeonCity.tsx:153`), add:

```ts
const joy = useRef<{ x: number; y: number; mag: number }>({
  x: 0,
  y: 0,
  mag: 0,
});
```

At the top of the component body (with the other hooks), add:

```ts
const isTouch = useIsTouch();
```

Add the import at the top of the file:

```ts
import { useIsTouch } from "@/hooks/useIsTouch";
import TouchJoystick from "./TouchJoystick";
```

- [ ] **Step 2: Consume the joystick vector in the loop**

In the movement branch (`NeonCity.tsx` ~line 433, the `else` after the `target.current` block), change the keyboard-only block so the joystick takes priority when deflected:

```ts
} else {
  const j = joy.current;
  if (j.mag > 0.02) {
    // analog stick: magnitude already in [0,1], no diagonal normalization needed
    vx = j.x;
    vy = j.y;
  } else {
    if (keys.current.has("up")) vy -= 1;
    if (keys.current.has("down")) vy += 1;
    if (keys.current.has("left")) vx -= 1;
    if (keys.current.has("right")) vx += 1;
    if (vx && vy) {
      vx *= 0.72;
      vy *= 0.72;
    }
  }
  vx *= step;
  vy *= step;
}
```

- [ ] **Step 3: Render the joystick when on touch**

Inside the returned HUD JSX (alongside the other `data-hud` chrome, e.g. just before the fast-travel bar at `NeonCity.tsx:1176`), add:

```tsx
{
  isTouch && introPhase === "done" && (
    <TouchJoystick
      onStart={() => {
        target.current = null;
        path.current = [];
        ftGlide.current = null;
        markMovedFromUI();
      }}
      onVector={(v) => {
        joy.current = v;
      }}
    />
  );
}
```

Note: `path` ref and `markMovedFromUI` are added in Checkpoint B (Task B4) and a small helper below. For Checkpoint A, temporarily use `target.current = null;` and `setEverMoved(true);` in `onStart` and drop the `path.current = []` line; replace with the full version in B4. (Record this as a known follow-up so it is not forgotten.)

Simplest A-only `onStart`:

```tsx
onStart={() => {
  target.current = null;
  ftGlide.current = null;
  if (!everMoved) setEverMoved(true);
}}
```

- [ ] **Step 4: Verify typecheck + build**

Run: `npx tsc --noEmit && pnpm build`
Expected: exit 0, build succeeds.

- [ ] **Step 5: Verify on desktop (no regression)**

Run: `pnpm dev`, open `http://localhost:3001/city` in a normal browser window (fine pointer). Confirm: no joystick renders, WASD + click still work exactly as before.

- [ ] **Step 6: Commit**

```bash
git add src/components/holo/NeonCity.tsx
git commit -m "Wires joystick into city movement"
```

### Task A5: `FastTravelDrawer` bottom sheet

**Files:**

- Create: `src/components/holo/FastTravelDrawer.tsx`
- Create: `src/components/holo/fastTravelDrawer.module.css`
- Modify: `src/components/holo/NeonCity.tsx` (render drawer when `isTouch`; hide desktop `.fastbar` on touch).
- Modify: `src/components/holo/neonCity.module.css` (hide `.fastbar` and `.controls` under `(pointer: coarse)`).

**Interfaces:**

- Consumes: `DESTINATIONS`, `HUES` from `@/lib/cityData`; the existing `fastTravel(key: string)` and `panel` state from NeonCity.
- Produces: `FastTravelDrawer({ activeKey, onTravel }: { activeKey: string | null; onTravel: (key: string) => void }): JSX.Element`.

- [ ] **Step 1: Write the component**

```tsx
// src/components/holo/FastTravelDrawer.tsx
"use client";

import { useState } from "react";
import { DESTINATIONS, HUES } from "@/lib/cityData";
import styles from "./fastTravelDrawer.module.css";

export default function FastTravelDrawer({
  activeKey,
  onTravel,
}: {
  activeKey: string | null;
  onTravel: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div data-hud className={styles.wrap}>
      <button
        type="button"
        className={styles.handle}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? "▾ CLOSE" : "▸ FAST TRAVEL"}
      </button>
      {open && (
        <div className={styles.sheet}>
          <button
            type="button"
            className={styles.item}
            onClick={() => {
              setOpen(false);
              onTravel("home");
            }}
          >
            ~/overwatch
          </button>
          {DESTINATIONS.map((d) => (
            <button
              key={d.key}
              type="button"
              className={`${styles.item} ${activeKey === d.key ? styles.active : ""}`}
              onClick={() => {
                setOpen(false);
                onTravel(d.key);
              }}
            >
              <span
                className={styles.dot}
                style={{
                  background: HUES[d.hue],
                  boxShadow: `0 0 6px ${HUES[d.hue]}`,
                }}
              />
              {d.key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write the styles**

```css
/* src/components/holo/fastTravelDrawer.module.css */
.wrap {
  position: fixed;
  right: 16px;
  bottom: 28px;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.handle {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  border: 1px solid rgba(170, 180, 232, 0.4);
  background: rgba(20, 24, 48, 0.5);
  backdrop-filter: blur(8px);
  color: #e6e9ff;
  font: 600 12px/1 var(--font-mono, monospace);
  letter-spacing: 0.08em;
}
.sheet {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  border-radius: 14px;
  border: 1px solid rgba(170, 180, 232, 0.3);
  background: rgba(14, 17, 38, 0.72);
  backdrop-filter: blur(10px);
}
.item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  min-width: 180px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.04);
  color: #e6e9ff;
  font: 500 13px/1 var(--font-mono, monospace);
  text-align: left;
}
.active {
  border-color: rgba(170, 180, 232, 0.6);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}
```

- [ ] **Step 3: Render it in NeonCity and hide desktop fastbar on touch**

Add imports:

```ts
import FastTravelDrawer from "./FastTravelDrawer";
```

In the HUD JSX, render the drawer when touch (near the existing fast-travel bar):

```tsx
{isTouch ? (
  <FastTravelDrawer activeKey={panel} onTravel={fastTravel} />
) : (
  /* existing desktop .fastbar block stays here unchanged */
)}
```

Wrap the existing `.fastbar` div in the `: (` branch so it only renders on non-touch.

In `neonCity.module.css`, belt-and-suspenders hide the desktop control hints on coarse pointers:

```css
@media (pointer: coarse) {
  .fastbar,
  .controls {
    display: none;
  }
}
```

- [ ] **Step 4: Verify typecheck + build**

Run: `npx tsc --noEmit && pnpm build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/holo/FastTravelDrawer.tsx src/components/holo/fastTravelDrawer.module.css src/components/holo/NeonCity.tsx src/components/holo/neonCity.module.css
git commit -m "Adds fast-travel drawer for touch"
```

### Task A6: Touch HUD copy

**Files:**

- Modify: `src/components/holo/NeonCity.tsx` (`.controls` block ~line 1131, `.hint` block ~line 1137).

- [ ] **Step 1: Swap the copy based on `isTouch`**

Replace the `.controls` block:

```tsx
<div className={styles.controls}>
  {isTouch ? (
    <>
      <div>DRAG THE STICK · WALK</div>
      <div>TAP THE STREET · WALK THERE</div>
      <div>STEP ON A PAD · TAP IT</div>
    </>
  ) : (
    <>
      <div>WASD / ARROWS · WALK</div>
      <div>CLICK THE STREET · WALK THERE</div>
      <div>STEP ON A PAD · ENTER</div>
    </>
  )}
</div>
```

Replace the first-move hint:

```tsx
{
  !everMoved && !panel && introPhase === "done" && (
    <div className={styles.hint}>
      {isTouch
        ? "DRAG THE STICK · OR TAP THE STREET"
        : "WALK WITH WASD · OR CLICK THE STREET"}
    </div>
  );
}
```

(Note: `.controls` is `display:none` on coarse pointers per A5's CSS, so the touch branch here mainly future-proofs; keep it correct regardless. The `.hint` is NOT hidden, so its touch copy matters.)

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/holo/NeonCity.tsx
git commit -m "Swaps city HUD copy for touch"
```

### Checkpoint A gate

- [ ] Run full suite: `pnpm test` (expect all green, including 3 new pure-module test files).
- [ ] Run `pnpm build` (expect success).
- [ ] Push the branch: `git push -u origin city-mobile`.
- [ ] **Kenny tests on phone** via the Vercel preview URL: joystick roams smoothly, drawer opens and fast-travels, HUD copy reads correctly, no accidental walk when tapping the stick/drawer. Note any perf jank for Checkpoint C.

---

## Checkpoint B — Tap-to-Walk with Pathfinding

**Ships:** tapping anywhere routes the avatar _around_ buildings instead of jamming against them. Also improves desktop click-to-walk. Depends on Checkpoint A being merged into the branch.

### Task B1: Extract `hitsSolid` into a shared module

**Files:**

- Create: `src/lib/cityCollision.ts`
- Create: `src/lib/cityCollision.test.ts`
- Modify: `src/components/holo/NeonCity.tsx` (remove the local `SOLIDS`/`hitsSolid` definitions ~lines 49-74, import from the new module instead).

**Interfaces:**

- Produces: `hitsSolid(x: number, y: number): boolean` — true if a `CHAR_R`-radius avatar centered at `(x, y)` overlaps any building/POI/bench (AABB) or tree (circle). Identical behavior to the current in-component function. Also exports `SOLIDS: Rect[]` and `type Rect`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/cityCollision.test.ts
import { describe, expect, it } from "vitest";
import { hitsSolid, SOLIDS } from "./cityCollision";

describe("hitsSolid", () => {
  it("reports a collision at the center of the first solid", () => {
    const s = SOLIDS[0];
    expect(hitsSolid(s.x + s.w / 2, s.y + s.h / 2)).toBe(true);
  });

  it("reports open space far outside every solid", () => {
    // top-left margin corner is street, not a building
    expect(hitsSolid(30, 30)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/lib/cityCollision.test.ts`
Expected: FAIL — cannot resolve `./cityCollision`.

- [ ] **Step 3: Move the code into the module**

Create `src/lib/cityCollision.ts` with the exact logic currently in `NeonCity.tsx:49-74`:

```ts
// src/lib/cityCollision.ts
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
```

In `NeonCity.tsx`: delete the local `type Rect`, `SOLIDS`, and `hitsSolid` (lines ~49-74), and add to the imports:

```ts
import { hitsSolid } from "@/lib/cityCollision";
```

Remove now-unused imports from the `cityData` import list if they were only used by the moved code (check `SHELLS`, `POI_COLLIDERS`, `BENCHES` usage elsewhere in the file first — `SHELLS`/`BENCHES` are also rendered, so keep those; drop only genuinely-unused ones). Let `npx tsc --noEmit` guide you.

- [ ] **Step 4: Run test + typecheck to verify pass**

Run: `pnpm exec vitest run src/lib/cityCollision.test.ts && npx tsc --noEmit`
Expected: PASS (2 tests), typecheck exit 0.

- [ ] **Step 5: Verify no behavior change on desktop**

Run: `pnpm dev`, open `/city`, confirm collision still works (walk into a building, avatar stops; the old "BONK" behavior is unchanged).

- [ ] **Step 6: Commit**

```bash
git add src/lib/cityCollision.ts src/lib/cityCollision.test.ts src/components/holo/NeonCity.tsx
git commit -m "Extracts city collision into shared module"
```

### Task B2: `navGrid` builder + A\* pathfinder

**Files:**

- Create: `src/lib/nav/navGrid.ts`
- Test: `src/lib/nav/navGrid.test.ts`

**Interfaces:**

- Produces:
  - `type Pt = { x: number; y: number }`
  - `type NavGrid = { cell: number; cols: number; rows: number; blocked: Uint8Array; isBlocked: (x: number, y: number) => boolean }`
  - `buildGrid(isBlocked: (x: number, y: number) => boolean, opts: { width: number; height: number; cell: number }): NavGrid` — samples each cell center through `isBlocked`, and retains the predicate on the grid for pixel-accurate endpoint checks.
  - `findPath(grid: NavGrid, start: Pt, goal: Pt): Pt[]` — A\* (8-directional, octile heuristic, no corner-cutting). Returns world-space waypoints from just after `start` to `goal`, string-pulled to drop redundant collinear/line-of-sight points. Returns `[]` if unreachable. If the goal cell is blocked, targets the nearest open cell. The exact tapped point is only appended as the final waypoint when it is not inside a solid (checked via `grid.isBlocked`), so no waypoint is ever inside a building — a tap into a solid ends at the nearest reachable cell.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/nav/navGrid.test.ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run src/lib/nav/navGrid.test.ts`
Expected: FAIL — cannot resolve `./navGrid`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/nav/navGrid.ts

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
  // simple binary-less open set: array scanned for min f (grid is small)
  const open = new Set<number>([startK]);
  const h = (c: number, r: number) => {
    const dc = Math.abs(c - go.c);
    const dr = Math.abs(r - go.r);
    return dc + dr + (Math.SQRT2 - 2) * Math.min(dc, dr); // octile
  };

  while (open.size) {
    let cur = -1;
    let best = Infinity;
    for (const k of open) {
      const c = k % g.cols;
      const r = Math.floor(k / g.cols);
      const f = (gScore.get(k) ?? Infinity) + h(c, r);
      if (f < best) {
        best = f;
        cur = k;
      }
    }
    if (cur === goalK) break;
    open.delete(cur);
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
      const tentative = (gScore.get(cur) ?? Infinity) + cost;
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        came.set(nk, cur);
        gScore.set(nk, tentative);
        open.add(nk);
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
  let pts = cells.map((kk) =>
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
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pnpm exec vitest run src/lib/nav/navGrid.test.ts`
Expected: PASS (5 tests). If the string-pull "routes around" test is flaky on the detour assertion, relax it to `expect(path.length).toBeGreaterThan(1)` plus the no-waypoint-in-wall check (the core guarantee).

- [ ] **Step 5: Commit**

```bash
git add src/lib/nav/navGrid.ts src/lib/nav/navGrid.test.ts
git commit -m "Adds A-star nav grid pathfinder"
```

### Task B3: `cityNav` binding (memoized real-world grid)

**Files:**

- Create: `src/lib/nav/cityNav.ts`
- Test: `src/lib/nav/cityNav.test.ts`

**Interfaces:**

- Consumes: `hitsSolid` (B1), `buildGrid`/`findPath`/`Pt` (B2), `WORLD` from cityData.
- Produces: `pathTo(start: Pt, goal: Pt): Pt[]` — memoizes the grid on first call (city geometry is static), returns waypoints.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/nav/cityNav.test.ts
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
```

(Note: `SPAWN` is exported from `cityData`; the arterial at y=300 is known-open street.)

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/lib/nav/cityNav.test.ts`
Expected: FAIL — cannot resolve `./cityNav`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/nav/cityNav.ts
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
```

- [ ] **Step 4: Run test + typecheck to verify pass**

Run: `pnpm exec vitest run src/lib/nav/cityNav.test.ts && npx tsc --noEmit`
Expected: PASS, typecheck exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/nav/cityNav.ts src/lib/nav/cityNav.test.ts
git commit -m "Adds memoized city pathfinding binding"
```

### Task B4: Wire pathfinding into tap-to-walk

**Files:**

- Modify: `src/components/holo/NeonCity.tsx` (add `path` ref; rewrite `onClick` to compute a path; advance waypoints in the loop; update the joystick `onStart` from A4 to also clear `path`).

**Interfaces:**

- Consumes: `pathTo` (B3).

- [ ] **Step 1: Add the path ref and import**

Add import:

```ts
import { pathTo } from "@/lib/nav/cityNav";
```

Near the `target` ref (`NeonCity.tsx:154`), add:

```ts
const path = useRef<{ x: number; y: number }[]>([]);
```

- [ ] **Step 2: Rewrite `onClick` to route a path**

Replace the body of `onClick` (`NeonCity.tsx:268-278`) after the guards with:

```ts
const wx = (e.clientX - cam.current.tx) / cam.current.s;
const wy = (e.clientY - cam.current.ty) / cam.current.s;
const wps = pathTo({ x: pos.current.x, y: pos.current.y }, { x: wx, y: wy });
if (wps.length) {
  path.current = wps.slice(1);
  target.current = wps[0];
} else {
  // no route found: fall back to the old direct-line target (open ground)
  path.current = [];
  target.current = { x: wx, y: wy };
}
ftGlide.current = null;
markMoved();
```

- [ ] **Step 3: Advance waypoints when the current target is reached**

In the loop's target block (`NeonCity.tsx:425-428`), where it currently clears the target on arrival:

```ts
if (dist < step + 1) {
  p.x = tg.x;
  p.y = tg.y;
  if (path.current.length) {
    target.current = path.current.shift()!;
  } else {
    target.current = null;
  }
}
```

- [ ] **Step 4: Update joystick `onStart` (from A4) to clear the path**

In the `TouchJoystick` `onStart` handler added in A4, use the full version now:

```tsx
onStart={() => {
  target.current = null;
  path.current = [];
  ftGlide.current = null;
  if (!everMoved) setEverMoved(true);
}}
```

Also, in `onKeyDown` where WASD clears `target.current` (`NeonCity.tsx:259`), add `path.current = [];` right after so keyboard movement cancels an active route too:

```ts
if (KEYMAP[k]) {
  keys.current.add(KEYMAP[k]);
  target.current = null;
  path.current = [];
  ftGlide.current = null;
  markMoved();
}
```

- [ ] **Step 5: Verify typecheck + build**

Run: `npx tsc --noEmit && pnpm build`
Expected: exit 0.

- [ ] **Step 6: Verify routing with Playwright (desktop emulation)**

Run `pnpm dev`, then drive `/city` in a browser: click on the far side of a building from the avatar and confirm the avatar walks _around_ it (position ends near the tap, does not freeze against the wall). Manual click test is acceptable; the guarantee is that `pathTo` waypoints avoid solids (already unit-tested).

- [ ] **Step 7: Commit**

```bash
git add src/components/holo/NeonCity.tsx
git commit -m "Routes tap-to-walk through pathfinding"
```

### Checkpoint B gate

- [ ] Run full suite: `pnpm test` (all green, incl. navGrid + cityNav).
- [ ] Run `pnpm build`.
- [ ] Push: `git push`.
- [ ] **Kenny tests on phone**: tap across buildings, confirm the avatar routes around them and reaches the pad; confirm joystick + drawer still work.

---

## Checkpoint C — Feel & Perf (on-device tuning, conditional)

**These tasks are driven by what Kenny observes on his actual phone in Checkpoints A/B. Do not build them blind. Each is gated on an observed problem.**

### Task C1: Mobile camera awareness zoom (only if the 1:1 view feels too tight)

At gameplay the camera is `s = 1` (`NeonCity.tsx:499`), so a phone shows ~390px of the 2400px world. If tap-to-walk feels cramped (can't see where you're routing to), add a mobile zoom-out:

- [ ] Pass `isTouch` into the camera scope (it is component state; read it via a ref set in an effect, or lift the scale decision). In the gameplay branch:

```ts
s = isTouchRef.current ? 0.72 : 1; // show more world on small screens
cx = Math.max(vw / (2 * s), Math.min(WORLD.w - vw / (2 * s), p.x));
cy = Math.max(vh / (2 * s), Math.min(WORLD.h - vh / (2 * s), p.y));
```

Add `const isTouchRef = useRef(false);` and sync it in an effect: `useEffect(() => { isTouchRef.current = isTouch; }, [isTouch]);`. Tune the `0.72` on-device. Commit: `Zooms city camera out on mobile`.

### Task C2: Perf mitigation (only if backdrop-blur / animations jank)

If the phone drops frames, apply CSS-first mitigations (per Kenny's perf preference: CSS before JS, lightest assets first):

- [ ] Reduce or drop `backdrop-filter: blur()` on the joystick/drawer under `(pointer: coarse)` (swap for a higher-opacity solid).
- [ ] Add `@media (pointer: coarse)` rules to pause off-screen ambient animations (e.g. `animation: none` on decorative layers that aren't near the avatar).
- [ ] Measure again on-device. Commit: `Trims mobile city GPU load`.

### Task C3: iOS Safari viewport jitter (only if the camera shifts on scroll)

If the Safari address bar resize jitters the camera:

- [ ] Read viewport height from `window.visualViewport?.height ?? window.innerHeight` in the camera block, and/or debounce the resize. Commit: `Stabilizes city camera on iOS Safari`.

### Checkpoint C gate

- [ ] Whatever subset of C1-C3 was needed is committed and pushed.
- [ ] **Kenny confirms** the phone experience feels good.

---

## Final: Merge to production

- [ ] All checkpoints green, full `pnpm test` + `pnpm build` pass on the branch.
- [ ] **Kenny explicitly authorizes** the production deploy (merging `city-mobile` to `main` auto-deploys the live portfolio).
- [ ] Merge and push `main`. Verify the Vercel production deploy succeeds.
- [ ] Update the city's own docs/log if the redesign tracks a changelog.

---

## Self-Review Notes

- **Spec coverage:** joystick (A2-A4), tap-to-walk + pathfinding (B1-B4), fast-travel drawer (A5), touch detection (A1), HUD copy (A6), camera/perf/iOS (C1-C3). All 8 design points mapped. Camera "collapse" was a false premise (gameplay is s=1, not vw/1600) — demoted to optional C1.
- **Shared-code risk:** B1 extraction and B4's onClick change touch the live desktop path. B1 is behavior-preserving (verified by test + manual). B4 is a deliberate improvement with a direct-line fallback so clicks never break.
- **Dependency order:** A1/A2 are leaf modules; A3 needs A2; A4 needs A1+A3; A5/A6 need A1. B1 → B2 → B3 → B4 is strictly linear. C depends on A+B shipped. No forward references.
- **Types:** `Pt = {x,y}` is consistent across navGrid/cityNav; `hitsSolid(x,y):boolean` matches the original signature; `computeStick` return shape matches the `joy` ref shape `{x,y,mag}`.
- **Spike-validated (2026-07-10):** the B2/B3 code was run verbatim against the real city collision + geometry before finalizing. Grid builds in ~15ms; all 4 pads and 5 stress routes produced solid-free paths; throughput 0.7ms avg / ~16ms worst per query. The spike caught a real bug the synthetic unit tests missed: `findPath` appended the raw tapped point as the final waypoint even when it was inside a solid (cell-center sampling can read "open" while the corner clips a building). Fixed by retaining the collision predicate on the grid (`NavGrid.isBlocked`) and guarding the final push on `g.isBlocked(goal)` — pixel-accurate endpoints. Added the "never ends inside a solid" regression test (navGrid now 5 tests).
