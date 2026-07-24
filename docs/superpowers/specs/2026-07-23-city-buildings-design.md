# Neon City — New Buildings

**Date:** 2026-07-23
**Branch:** `city-buildings-design`
**Inputs:** [design brief](./2026-07-22-city-buildings-design.md) · [designer mockup inventory](./2026-07-23-designer-mockup-inventory.md) · `~/Downloads/design_handoff_neon_city_v3`

Populate the walkable `/city` scene with commerce, a projects mall, and flavor
buildings so the world reads as inhabited rather than staged.

The designer's v3 mockup is the visual reference. It is not the source of
truth. Every number below is verbatim from the mockup; every string is ours.

## Decisions already made

| #   | Decision                 | Outcome                                                                                                             |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 1   | World size               | Grow east to **3200×1600** (was 2400×1600)                                                                          |
| 2   | Roof-lift animation      | Ship **split**; iris and fade stay live-switchable for evaluation                                                   |
| 3   | Shell buildings          | Rebuild by hand with varied size/rotation/silhouette + row-home terraces                                            |
| 4   | Park                     | Adopt the mockup's interior; drop `PARK.platform`; move nameplate to (1090, 700)                                    |
| 5   | Marina                   | Move to x 3108 with the east wall                                                                                   |
| 6   | Streets                  | Extend arterial to 3200; add spur P6, crosswalk (2440, 284), footbridge                                             |
| 7   | Copy                     | Ignore all designer copy. Project copy derives from Keystatic; everything else is written fresh in the city's voice |
| 8   | Variant panel            | Dev-only (`?dev=1`), deleted once the winners are chosen                                                            |
| 9   | Shell authoring          | Hand-placed literal array in `cityData.ts`                                                                          |
| 10  | In-progress detail pages | Stay reachable, just unlisted — the permit board needs a target                                                     |
| 11  | Flavor interaction       | Scenery only, except Madame Oracle's rerollable fortunes                                                            |
| 12  | Long descriptions        | Optional `cityBlurb` field; never truncate                                                                          |
| 13  | Projects pavilion        | **Survives.** The Galleria does not replace it                                                                      |
| 14  | Footbridge               | **Cut.** Only fits in a layout without the pavilion                                                                 |

### Why the pavilion stays (decided during T2)

The mockup deletes the Projects pavilion and moves everything projects-related
into the Galleria. Taking that wholesale would strand the city's center of
gravity 1800px from spawn and leave `/projects` without a door.

Instead the two are complementary: the **pavilion is the index door**
(`/projects`, near spawn), the **Galleria is where you walk among individual
projects** (east). Keeping both is what forced the footbridge out — it
overlapped the pavilion by 150 of its 184px.

**Consequence:** the Galleria kiosk's purpose is open again. In the designer's
layout it was the obvious home for the `/projects` door; that job is taken. It
needs a reason to exist or it becomes scenery. Resolve during T4.

## Architecture

The city is pure DOM/CSS — absolutely-positioned divs in a fixed world, camera
via CSS transform, one `requestAnimationFrame` loop mutating styles through
refs. Nothing here changes that.

Three existing seams carry all the work:

- **`src/lib/cityData.ts`** — the world's data. New and widened exports land here.
- **`src/lib/cityCollision.ts`** — already spreads `POI_COLLIDERS` into its
  solids list. Every new collidable thing goes through that one array, so
  collision needs no structural change.
- **`src/components/holo/NeonCity.tsx`** — rendering. New layers are added as
  sibling components alongside `StreetLayer()`, not woven into it.

Two rules keep this from rotting:

**Geometry is declared once.** The mockup duplicates every building's position
between its template and its `_solids` array, and a third time in the mall's
`nearGap` test. We derive collision from the same literal that drives the
visual. A building that renders is a building you can't walk through, with no
second edit.

**The mall is a component, not a region of the scene.** `GalleriaLayer` owns
the shell, roof, units, and unit pads, and receives its origin as a prop. Unit
coordinates stay mall-relative so the whole thing can be repositioned by
changing two numbers.

### Format traps

Two conversions that will silently corrupt geometry if copied naively from the
mockup — both already burned into the existing codebase's conventions:

- **Pads.** Mockup pads are top-left rects. Production `Destination.pad` is
  **center-based**, converted by `padRect()`. New pads follow production.
- **Trees.** Mockup trees are top-left + diameter. Production `TREES` is
  **center + radius**. Existing entries are already converted; new ones must be.

## The Galleria

Origin **(2560, 430)**, shell 520×620. Entrance gap in the west wall at world
y 690–780, marked by a cyan glow strip and a dashed ground apron. Ground label
`GALLERIA DISTRICT` at (2640, 1108). Decorative kiosk at (2410, 560), 90×80 —
no interaction, it exists so the entrance has a foreground element.

### Roof

Closed by default. Opens when:

```
inside  = cx ∈ (MX+16, MX+504) && cy ∈ (MY+16, MY+604)
nearGap = cx ∈ (MX−60, MX+40) && cy ∈ (MY+240, MY+370)
open    = inside || nearGap
```

Derived per frame from player position — no state, no hysteresis, so it
reverses on exit for free.

Three animations, one shipped:

- **split** (default) — halves slide apart on ±104% translateX. Reads as "the
  cover comes off", which is the effect being asked for.
- **iris** — `clip-path: circle(78% → 0%)`.
- **fade** — opacity only.

Roof surface is decorative detail on the closed roof: skylights, HVAC yard,
billboard, or painted logo. The mockup's skylights are illegible at street
zoom; they get redrawn as barrel vaults with visible mullions and a specular
highlight, or cut if they still don't read.

### Units — data-driven, self-balancing

14 physical slots. Slots are fixed geometry; occupancy is derived:

1. Projects sort by `featured` desc, then `order` asc, then `date` desc.
2. The two anchor slots (largest) take the first two projects in that order.
   Since `featured` sorts first, anchors are featured projects whenever any
   exist; with fewer than two featured, the sort still yields a deterministic
   filling and no slot is left ambiguous.
3. Remaining projects fill remaining slots in order.
4. Each unit renders by its project's `status`: `live` → open storefront,
   `in-progress` → hoarding + permit board.
5. Slots with no project render **FOR LEASE**.

With 9 projects today: 9 occupied, 5 for lease. Publishing a tenth project
consumes a lease slot with no code change. This is the reason the mall can be
oversized without looking abandoned — vacancy is the intended texture, and it
shrinks as the portfolio grows.

Unit accent color comes from the existing `district` field via `HUES`, so
sports/games/tools/client-web already read as distinct storefronts.

Unit pads derive from unit geometry (mall-relative):

```
S: { x: rx + w/2 − 24, y: ry + h + 5,    w: 48, h: 30 }
N: { x: rx + w/2 − 24, y: ry − 35,       w: 48, h: 30 }
W: { x: rx − 39,       y: ry + h/2 − 24, w: 34, h: 48 }
E: { x: rx + w + 5,    y: ry + h/2 − 24, w: 34, h: 48 }
```

Stepping on a unit pad opens the standard teaser popover; Enter or the CTA
routes to that project's detail page.

### Schema change

Add to the `projects` collection in `keystatic.config.ts`:

```ts
status: fields.select({
  label: "Status",
  options: [
    { label: "Live", value: "live" },
    { label: "In progress", value: "in-progress" },
  ],
  defaultValue: "live",
}),
```

`in-progress` projects are **excluded from `/projects`** and appear only as
construction units in the mall. This is the mechanism the original ask
described: tag a project as WIP and a permit board goes up in the city.

There is no `for-lease` status. Vacancy is the absence of a project, not a
value on one.

## New buildings

Coordinates verbatim from the mockup; copy is ours.

**Commerce (interactive).** Adkins Supply Co. merch (1205, 8) and The Daily
Grind café (1125, 390). Both are destinations with pads and teasers. Neither
storefront URL exists yet, so both ship in an **opening-soon** state.

Opening-soon is a derived state, not a separate building. A commerce
destination whose `href` is empty renders:

- an **OPENING SOON placard mounted on the building exterior**, legible at
  street zoom and readable without stepping on the pad,
- a teaser whose CTA is disabled and says so plainly,
- unlit or half-lit signage, so the storefront reads as not-yet-open from a
  distance.

Filling in the `href` removes the placard, lights the sign, and enables the
CTA. One field, no code change, nothing to remember to delete. Both URLs are
roadmap items for the portfolio site and land after this work.

**Tie-ins (interactive).** The Stacks library → studio notes. Observatory →
currently-learning. The Marquee theater → changelog. Arcade → Ricochet Rogue.
Museum keeps its Diggs Johnson banner. All route to real pages.

**Ambiance (non-interactive).** Stretch.css yoga (1270, 420), Reps & Renders
gym (1430, 410), Suds Cycle laundromat (1920, 600), Gridline Diner (2450, 140),
water tower (2870, 120), Taco Process truck (930, 1030), Fade Function barber
(1150, 1265), Madame Oracle (1160, 1390), ramen (590, 1345), night market
(1450, 1380), three rotating billboards.

Yoga and gym are deliberately both present. Duplication is not a defect here.

**Footbridge** "Terminal Walk" (730, 706), 184×38 — **non-collidable**, a
walkable corridor from the rail platform to the park.

## Shells

Replaced wholesale. The current 13 are one rectangle at one rotation repeated,
which is the flatness being fixed. The new array varies:

- **Size** — small infill boxes through large blocks.
- **Rotation** — a wider spread than the current ±2°.
- **Silhouette** — asymmetric `border-radius`, occasional setbacks.
- **Rooftop detail** — billboard, skylight, HVAC, or bare, mixed across the city.
- **Terraces** — runs of 4–5 shells sharing a wall, reading as row homes.

A terrace is authored as a group and emits **one merged collider**, not five.
This is deliberate: five adjacent boxes leave sub-player-width slots the player
can wedge into. The mockup has exactly that bug between its café and yoga
studio.

## Dev variant panel

Mounted only when the URL carries `?dev=1`. Switches roof-lift animation,
rooftop-detail mix, and shell variant live; persists to `localStorage` so a
setting survives a reload while walking the city.

It is scaffolding. Once the winners are chosen, the panel and the losing
branches are deleted in one commit. It must not be reachable without the query
param and must add nothing to the default render path.

## Known defects in the mockup

Carried forward so they don't get ported. Full list in the inventory doc,
section F.

- Wrong project blurbs (On the Clock described as shift scheduling — it is an
  NFL draft tracker).
- Resume teaser claims "staff engineer".
- Fabricated `kendall@adkins.dev` mailto links → route to `/contact`.
- Every `href` points at a DC stand-in file.
- Shell at (2336, 190) overlaps the diner by ~6px.
- Several pads clip the hanging labels, violating the designer's own 26px
  clearance rule.
- A 5px impassable slot between café and yoga.
- An unreachable 28px strip east of the mall.

## Build order

Each phase is independently verifiable and leaves the city playable.

1. **Foundation** — world 3200×1600, camera clamps, arterial extension, spur
   P6, crosswalk, footbridge, park adoption, marina move.
2. **Galleria** — shell, roof + three animations, dev panel, 14 slots, unit
   pads and teasers, kiosk, district label.
3. **Content** — `status` field, `/projects` filtering, Keystatic-driven unit
   occupancy.
4. **Commerce** — merch and café with opening-soon states.
5. **Tie-ins** — library, observatory, marquee, arcade, museum banner.
6. **Ambiance** — flavor buildings, billboards, oracle.
7. **Shells** — rebuilt array with terraces and rooftop variety.
8. **Cutover** — pick roof and rooftop winners, delete the dev panel and losing
   branches.

## Verification

- Walk the full world perimeter; the camera never reveals void past the clamps.
- Every new building rejects the player; the footbridge does not.
- No sub-player-width gap anywhere (player radius 13, so nothing under 26px).
- Mall roof opens on entry and closes on exit, from both the gap and inside.
- Every pad's teaser routes to a real page; no `#`, no stand-in, no mailto.
- Marking a project `in-progress` removes it from `/projects` and raises a
  permit board in the mall.
- Removing a project turns its unit into FOR LEASE with no code change.
- Without `?dev=1` the variant panel is absent from the DOM.
- Frame budget holds at the added element count.

## Out of scope

- Real merch and Buy-Me-a-Coffee URLs. Roadmap items; the buildings ship
  opening-soon and light up when the URLs arrive.
- Mall interior beyond storefronts — no interiors within interiors.
- Mobile-specific layout for the east district beyond existing fast travel.
- Any canvas/WebGL rewrite.
