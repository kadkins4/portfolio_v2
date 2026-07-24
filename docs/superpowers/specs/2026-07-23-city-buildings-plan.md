# Neon City Buildings — Implementation Plan

**Spec:** [2026-07-23-city-buildings-design.md](./2026-07-23-city-buildings-design.md)
**Reference numbers:** [2026-07-23-designer-mockup-inventory.md](./2026-07-23-designer-mockup-inventory.md)
**Branch:** `city-buildings-design`

Eight tickets. Each leaves `/city` playable and is verified before the next
starts. Tickets 4–7 are independent of one another once 1–3 land.

## Progress

| Ticket                  | State       | Commit    |
| ----------------------- | ----------- | --------- |
| T1 world widen          | **done**    | `c990e92` |
| T2 east approach + park | **done**    | `786b28e` |
| T3 project status       | done        | `2c57b65` |
| T4 Galleria shell/roof  | done        | `175efb7` |
| T5 Galleria units       | done        | `764e915` |
| T6–T8                   | not started | —         |

Verified at T2: 56 tests pass, `pnpm build` compiles clean, typecheck clean.

### What T1/T2 actually changed vs. what the plan predicted

Three of the mockup's "map-wide changes" turned out to already exist in
production — the curved streets, the camera clamps, and the entire park
interior (path bars, plaza circle, pond, all at identical coordinates). The
real work was much smaller than the handoff implied.

Deviations from plan, both deliberate:

- **East-edge furniture is bound to `WORLD.w`**, not shifted +800. Same pixels,
  but immune to the next resize.
- **Ambient traffic wrapped at a hardcoded `x > 2460`** — not in the plan.
  Left alone, cars would have vanished 740px short of the new east wall and the
  Galleria district would have had no passing traffic. Now derives from `WORLD`.
- **Footbridge cut** (see spec decision 14).
- Park spur gained its missing centerline dash (inventory jank item 12).

## Grounding (verified against source, not the mockup)

- Every camera clamp and SVG `viewBox` in `NeonCity.tsx` derives from
  `WORLD.w/h` (lines 483–543, 1288–1346). Widening the world is one constant.
  Do **not** port the mockup's hardcoded clamps.
- `src/lib/cityCollision.ts` builds `SOLIDS` from `DESTINATIONS`, `SHELLS`,
  `POI_COLLIDERS`, `BENCHES`, plus circular `TREES`. Every new solid enters
  through that file. It has a test at `cityCollision.test.ts`.
- `StreetLayer()` (line ~1332) already contains the mockup's curved streets
  verbatim. Street work is additive only.
- The marina is **hardcoded JSX** at `left: 2308, width: 92` (line ~2657), with
  a dock plank at `left: 2255` (line ~2671). Not data.
- `ROADS_H` / `ROADS_V` in `cityData.ts` are vestigial — nothing reads them.
- Projects are read in `src/app/(site)/projects/page.tsx`,
  `projects/[slug]/page.tsx`, and `src/app/feed.xml/route.ts`.
- Production pads are **center-based** (`padRect()`); mockup pads are top-left.
  Production trees are **center + radius**; mockup trees are top-left +
  diameter. Convert on the way in.

---

## T1 — Foundation: widen the world

**Goal.** The world is 3200×1600 and everything that assumed 2400 still lines up.

**Files.** `src/lib/cityData.ts`, `src/components/holo/NeonCity.tsx`

**Steps.**

1. `WORLD.w` 2400 → 3200.
2. Sweep `NeonCity.tsx` for hardcoded x-coordinates ≥ 2200 that represent
   east-edge furniture and shift them +800: marina `2308 → 3108`, dock plank
   `2255 → 3055`. Leave interior buildings (observatory 2140, shells) alone —
   they are city, not edge.
3. Extend the arterial: `M 0 320 L 2400 320` → `L 3200 320`, and its y282 /
   y358 edge lines with it.
4. Delete `ROADS_H` / `ROADS_V` and their type. Dead since the Layout C cutover.

**Verify.** Walk the east wall — water is flush, no void, no floating dock.
Walk the arterial to x3200 without the road ending under the player. `pnpm
build` clean.

**Risk.** Step 2 is the only judgement call in the ticket. Grep, don't guess;
an off-by-800 building is invisible until someone walks there.

---

## T2 — Foundation: east approach and park

**Goal.** The east district is reachable on foot and the park matches the mockup.

**Files.** `src/lib/cityData.ts`, `src/components/holo/NeonCity.tsx`

**Steps.**

1. Add spur P6 to `StreetLayer()`: `M 2085 700 C 2220 688 2350 700 2500 702`,
   rendered with the existing spur treatment (60/56 casing/bed).
2. Add the second crosswalk at (2440, 284), matching the existing 46×72 div at
   (986, 284).
3. ~~Add the footbridge "TERMINAL WALK" at (730, 706), 184×38.~~ **Cut.** It
   overlaps the Projects pavilion (780, 640, 150×260) by 150 of its 184px. The
   mockup could place it only because that layout deletes the pavilion. We keep
   the pavilion, so the bridge has nowhere to go.
4. Adopt the mockup's park interior (inventory §A). Move `PARK.nameplate` to
   (1090, 700). Delete `PARK.platform` — nothing outside `cityData.ts` reads
   it; the rail platform renders separately near line 1586.

**Verify.** Player walks rail platform → footbridge → park without collision.
Park nameplate is not overlapped by furniture. Spur connects visually to the
arterial at both ends. `PARK.platform` gone with no compile error.

---

## T3 — Content: project status

**Goal.** A project can be marked in-progress, and that removes it from
`/projects`.

**Files.** `keystatic.config.ts`, `src/app/(site)/projects/page.tsx`,
`src/app/(site)/projects/[slug]/page.tsx`, `src/app/feed.xml/route.ts`,
`content/projects/*.mdoc`

**Steps.**

1. Add `status: fields.select({ options: [live, in-progress], defaultValue: "live" })`
   to the projects collection.
2. Backfill `status: live` into all 9 existing `.mdoc` files.
3. Filter `in-progress` out of the projects index and the feed.
4. Decide the detail route: `in-progress` projects keep a reachable
   `[slug]` page (the mall's construction unit needs somewhere to point) but
   are not linked from the index.

**Verify.** Flipping one project to `in-progress` drops it from `/projects` and
from `feed.xml`, and its detail page still resolves. Test covers the filter.

**Note.** No `for-lease` value. Vacancy is the absence of a project.

---

## T4 — The Galleria: shell, roof, dev panel

**Goal.** A mall you can walk into, whose roof comes off.

**Files.** new `src/components/holo/GalleriaLayer.tsx`, `src/lib/cityData.ts`,
`src/lib/cityCollision.ts`, `src/components/holo/NeonCity.tsx`

**Steps.**

1. New `GalleriaLayer` component taking origin as a prop. Origin (2560, 430),
   shell 520×620, entrance gap in the west wall at world y 690–780 with cyan
   glow strip and dashed apron.
2. Wall colliders emitted **from the same literals that render the walls** —
   four rects with the gap subtracted from the west wall. Feed them into
   `cityCollision.ts` through a new export; do not duplicate coordinates.
3. Roof-open test, derived per frame, no state:
   ```
   inside  = cx ∈ (MX+16, MX+504) && cy ∈ (MY+16, MY+604)
   nearGap = cx ∈ (MX−60, MX+40) && cy ∈ (MY+240, MY+370)
   open    = inside || nearGap
   ```
4. Three roof animations behind one prop: `split` (halves translateX ±104%,
   default), `iris` (`clip-path: circle(78% → 0%)`), `fade`.
5. Dev panel mounted only when `?dev=1`, persisting to `localStorage`,
   switching roof animation live.
6. Kiosk at (2410, 560), 90×80, decorative and collidable. `GALLERIA DISTRICT`
   ground label at (2640, 1108).

**Verify.** Roof opens entering through the gap and closes on exit, from both
directions, with no flicker at the boundary. Player cannot pass through any
wall except the gap. Gap is ≥ 26px clear (player radius 13). Without `?dev=1`
the panel is absent from the DOM.

---

## T5 — The Galleria: units

**Goal.** 14 storefronts whose occupancy comes from Keystatic.

**Files.** `src/components/holo/GalleriaLayer.tsx`, `src/lib/cityData.ts`

**Steps.**

1. 14 slot literals, mall-relative `rx/ry/w/h` + face (N/S/E/W), two of them
   anchor-sized. Geometry from inventory §B.
2. Occupancy: sort projects by `featured` desc, `order` asc, `date` desc; two
   anchors first; remainder in order; empty slots render **FOR LEASE**.
3. Render by status: `live` → lit storefront, `in-progress` → hoarding +
   permit board.
4. Accent hue from the existing `district` field via `HUES`.
5. Pads derived from slot geometry:
   ```
   S: { x: rx + w/2 − 24, y: ry + h + 5,    w: 48, h: 30 }
   N: { x: rx + w/2 − 24, y: ry − 35,       w: 48, h: 30 }
   W: { x: rx − 39,       y: ry + h/2 − 24, w: 34, h: 48 }
   E: { x: rx + w + 5,    y: ry + h/2 − 24, w: 34, h: 48 }
   ```
6. Teaser copy from the project's `title` + `description`. If a description
   overflows the placard, add an optional `cityBlurb` field rather than
   truncating.

**Verify.** 9 storefronts and 5 FOR LEASE today. Deleting a project
turns its unit to FOR LEASE with no code change; adding a tenth consumes a
lease slot. Every live unit's CTA routes to a real `/projects/[slug]`. No pad
overlaps a hanging label (labels hang 13px below; leave 26px).

---

## T6 — Commerce

**Goal.** Merch and café exist and honestly say they aren't open.

**Files.** `src/lib/cityData.ts`, `src/components/holo/NeonCity.tsx`

**Steps.**

1. Adkins Supply Co. at (1205, 8); The Daily Grind at (1125, 390). Both are
   destinations with pads, doors, teasers.
2. Empty `href` derives the opening-soon state: exterior **OPENING SOON**
   placard legible at street zoom, disabled CTA saying so, unlit signage.
3. Filling the `href` lights the sign, drops the placard, enables the CTA —
   no other edit.

**Verify.** Both readable as closed from a distance without stepping on a pad.
Setting a placeholder `href` flips all three signals at once. Neither pad
routes anywhere while `href` is empty.

---

## T7 — Tie-ins and ambiance

**Goal.** The rest of the buildings.

**Files.** `src/lib/cityData.ts`, `src/components/holo/NeonCity.tsx`

**Steps.**

1. Interactive: The Stacks → studio notes; Observatory → currently-learning;
   The Marquee → changelog; Arcade → Ricochet Rogue; Museum keeps the Diggs
   Johnson banner.
2. Non-interactive: yoga (1270, 420), gym (1430, 410), laundromat (1920, 600),
   diner (2450, 140), water tower (2870, 120), taco truck (930, 1030), barber
   (1150, 1265), Madame Oracle (1160, 1390), ramen (590, 1345), night market
   (1450, 1380), three rotating billboards.
3. All copy written fresh in the city's voice (`✦ NEON CITY …` kickers,
   `> lowercase imperative` CTAs). **Batch it for review before it lands.**
4. Fix the mockup's shell/diner overlap at (2336, 190) when placing the diner.

**Verify.** No `#`, no stand-in href, no `mailto:` anywhere — contact routes to
`/contact`. No project blurb contradicts its Keystatic description. Every
non-interactive building collides. Nothing overlaps.

---

## T8 — Shells and cutover

**Goal.** The filler city stops looking like one stamped rectangle, and the
scaffolding comes out.

**Files.** `src/lib/cityData.ts`, `src/lib/cityCollision.ts`,
`src/components/holo/NeonCity.tsx`, `src/components/holo/GalleriaLayer.tsx`

**Steps.**

1. Replace `SHELLS` with a hand-placed array varying size, rotation,
   `border-radius` silhouette, and rooftop detail (billboard / skylight / HVAC
   / bare).
2. Add terraces: runs of 4–5 shells sharing walls, reading as row homes. A
   terrace emits **one merged collider**, not one per unit.
3. Redraw skylights as barrel vaults with visible mullions and a specular
   highlight. If they still read as mush at street zoom, cut the variant.
4. Kenny picks roof animation and rooftop mix in the `?dev=1` panel.
5. Delete the panel and the losing branches in one commit.

**Verify.** No gap anywhere under 26px — assert it in `cityCollision.test.ts`
by scanning solid pairs, so this can't regress. No shell overlaps a street,
pad, or building. Without `?dev=1` nothing dev-related is in the bundle.

---

## Global verification

Run before calling the feature done:

- `pnpm build` and `pnpm test` clean.
- Walk the full perimeter; camera never reveals void.
- Every pad routes to a real page.
- Frame budget holds at the new element count — measure, don't assume; this
  roughly doubles the DOM node count in the scene.
- Mobile: joystick reaches the east district; fast travel covers the distance.
