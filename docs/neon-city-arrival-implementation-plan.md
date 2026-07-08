# Neon City Arrival — Implementation Plan (draft)

Status: planning. No code written yet. Branch stays `neon-city` (never merged to main until Kenny says so).

## The uncomfortable framing first

This is not a "port a prototype" job, it is a **merge** of a cinematic prototype into a live, interactive app, and the prototype deliberately skipped the hard part. The README says it plainly: manual walking and collision are out of scope, they "live in the main app." So the designer built the parts that are easy to fake in a canvas (a scripted camera, a scripted avatar walk, path-following trains) and left us to reconcile them with the parts the real app already owns (free walking, collision, click-to-walk, teasers, routing).

Two things are in real tension:

1. **Camera model.** The prototype zooms the whole world to fit the screen (CSS `scale`), and the camera is scripted (follows the train, then frames the park). The live app is 1:1 pixels with the camera hard-following the player and clamped to world edges, no zoom. "Match the prototype 1:1" and "keep the city feeling like the playable thing we already have" pull in opposite directions. This is the single biggest decision and it drives most of the effort.
2. **The avatar.** In the prototype the avatar is a scripted dot that walks a fixed waypoint path during the intro, then freezes. In the app the avatar is player-controlled. The handoff moment (cinematic avatar becomes the player's avatar) is the seam we have to build and the prototype gives us nothing for it.

Everything else is comparatively mechanical.

## Source capture (acceptance checklist)

Exact values from `design_handoff_neon_city_arrival/Neon City Arrival.dc.html`, to verify against after the port.

### Layout C coordinates (world-space, 2400 x 1600)

- Terminal Park: 900, 560, 660 x 450. Border-radius `190px 70px 210px 90px`. Green radial fill, dashed inner ring.
- Projects pavilion: 780, 640, 150 x 260, radius `12px 18px 10px 16px`, cyan 190. Sits on the park's west edge, z-index above park.
  - Stairs (left): 736, 655, 44 x 64.
  - Entrance pad (right): 938, 790, 44 x 64.
  - "ENTER" label at 994, 812.
- Resume (ADKINS LINE, "( resume )"): 340, 430, 300 x 230, cyan 190, radius `20px 7px 16px 9px`. Door strip left-side, pad at 455, 668, 70 x 44.
- About (UNIT 4B, "( about )"): 1640, 600, 270 x 300, amber 46, radius `9px 17px 7px 23px`. Door strip right-side (faces park), pad at 1584, 700, 44 x 70.
- Contact (POST OFFICE, "( contact )"): 820, 1250, 300 x 180, purple 300, radius `18px 8px 24px 6px`. Door strip top-side, pad at 935, 1198, 70 x 44.
- Vertical platform: 696, 560, 36 x 250. Label "TERMINAL / ADKINS LINE" vertical.
- Landing / spawn point: 757, 714 (left of pavilion). Avatar rest pose during dwell.
- Drop-in frame (arrival view bounds): 110, 340, 1560 x 860.

### The Adkins Line rail (curved)

SVG path, drawn in 4 stacked strokes (shadow blur, outer glow 22px, core 13px lavender, dark 7px, dashed ties):

```
M 720 1660 C 750 1480 800 1420 770 1300 C 745 1195 600 1170 590 1030
C 583 930 680 905 680 810 L 680 480 C 680 330 640 260 560 200
C 470 130 380 80 320 -40
```

Train: 3 cars, 26 x 54 each, spaced 62px along the path (front at `sFront`, others at `sFront-27-i*62`), position from `getPointAtLength`, heading from tangent sampled +/-3px, rotation = `angle + 90`. Stop point `_stopS` = first path sample where `x approx 680` and `y <= 602`.

### Train state machine (drives ambient life)

- `in`: 8000ms, `sFront = easeInOut(t/8000) * stopS`.
- `dwell`: intro waits for walk-down (3800ms); ambient dwell 3500 + random 2500ms.
- `out`: 3800ms, `easeIn`, travels to `L + 280` (off-screen north).
- `away`: 9000 + random 14000ms, then back to `in`.
- Intro is the first `in` with the camera attached.

### Intro / avatar

- Avatar waypoints (walk-down): `[710,615] -> [722,650] -> [757,676] -> [757,714]`, 800ms pause then 2400ms smoothstep along the polyline. Total intro walk 3400ms, then control.
- Reduced-motion or `playIntro=false`: skip cinematic, start at landing `[757,714]`, trains stay ambient.

### Camera (renderVals)

- Cinematic (`intro === 'ride'`): `s = min(vw/1400, vh/800)`, capped 1.05, centered on train point, clamped.
- Arrival view: `s = min(vw/1600, vh/900)`, capped 1.1, centered 890, 770.
- Full map: `s = min(vw/2480, vh/1680)`, centered 1200, 800.
- Transform: `translate(vw/2 - cx*s, vh/2 - cy*s) scale(s)`. Transition `transform 1.4s cubic-bezier(.55,0,.2,1)` (none during ride).

### Streets (all decorative for the player)

- One straight arterial at y=320, edge to edge (78px bed). V1 cars run here.
- Curved streets drawn twice: outline `rgba(150,140,220,.13)` w68, bed `#0d0c17` w64, dashed centerline `rgba(243,237,226,.05)` w2 `24 40`. Five paths (west, east loop, south cross, north curve, park spur) plus a spur circle at 1090, 548.
- Arterial crosswalk 986, 284, 46 x 72. Tag "ARTERIAL . V1 TRAFFIC" at 60, 270.

### V1 traffic (simplified)

6 cars, 34 x 15, on two lanes (y=301 eastbound, y=339 westbound), speeds 2.0 to 2.5, wrap at +/-40. **No traffic lights, no nodes, no car-following** (arterial has no intersections). This is a large simplification of the current engine.

### Flavor POIs (bespoke, not enterable)

Museum (520,12 amber), Construction/"SITE 09" (1660,36 amber), Observatory (2140,30 purple), Arcade (40,410 cyan), Broadcast tower/"KNDL FM" (2050,1150 cyan), Ramen (590,1345 amber), Night Market (1450,1380 magenta), Pixel Pier gate (100,1300 magenta landmark, "Fairgrounds" district), Marina (2308,570 cyan, "Dockside"). Plus 13 plain gray shells (see `shells` array), 20 trees, 5 lamps, 5 benches, 4 district blobs, 4 ground labels.

### Tokens / grammar (unchanged from today)

- Ground `#0a0913` with 60px grid lines `rgba(120,110,200,.04)`. Page bg `#07060e`.
- Shells `#110f1e` / `#131120`. Hues: cyan `oklch(0.85 0.13 190)`, amber `oklch(0.8 0.12 46)`, magenta `oklch(0.75 0.16 340)`, purple `oklch(0.75 0.13 300)`, beacon red `oklch(0.72 0.19 25)`.
- Keyframes: `nc-blink`, `nc-pulse`, `nc-flick`, `nc-mflick`, `nc-fan`, `nc-ring`, `nc-steam`.
- Fonts: Libre Caslon Display, Instrument Serif (italic), DM Sans, JetBrains Mono. **All four already loaded** in `layout.tsx` as `--font-display`, `--font-instrument`, `--font-sans`, `--font-mono`. No new font loading.
- Overlays: radial vignette, 4px scanlines, 58px letterbox bars (slide in/out), centered caption, SKIP pill, HUD (title + REPLAY / ARRIVAL / FULL toggles).

## Current app baseline (what we are merging into)

- `NeonCity.tsx` (~1160 lines): one `requestAnimationFrame` loop handling movement, axis-separated collision (`hitsSolid` vs `SOLIDS` = destinations + fillers + benches, plus circular trees), click-to-walk (`target`), fast-travel glide to a pad then `openPanel`, camera = translate only (scale 1) clamped to world, WASD/arrows, traffic (straight grid + `NODES` lights + car-following), teaser popover, enter via `router.push(d.href)`.
- `cityData.ts`: all geometry (PARK, SPAWN 1230,940, straight ROADS_H/V, NODES, diagonal RAIL, DESTINATIONS at old scattered coords, FILLERS, TREES, BENCHES, LAMPS, DISTRICT_LABELS, teaser copy per destination).
- Camera has no zoom. Traffic engine is the rich grid version.

## Integration seams (the deltas that carry risk)

1. **Camera** — add scale/zoom + scripted cinematic path + handoff to the live follow-cam. Decision below.
2. **Spawn + all coords** — rewrite `cityData.ts` geometry to Layout C. SPAWN moves to 757,714. Rebuild `SOLIDS` for the new buildings + POIs + pavilion + platform so the player cannot walk through them, while leaving the stairs/pad walk-around usable.
3. **Rail + train** — new curved rail path + path-following train state machine, folded into the existing rAF loop (not a second loop).
4. **Intro sequence** — first-load cinematic (letterbox, captions, scripted camera, scripted avatar walk-down) then control handoff; skip + replay; reduced-motion fallback.
5. **Roads** — replace straight-grid rendering with the curved SVG street paths; keep one straight arterial.
6. **Traffic** — V1 runs 6 simple cars on the straight arterial (2 lanes, no lights/nodes/car-following). Keep the richer engine code (lights/nodes/car-following) intact but dormant/divorced from V1, as groundwork for V2 path-following cars. Do not delete it.
7. **POIs** — build ~9 bespoke flavor buildings + 13 shells as JSX (the bulk of the visual surface).
8. **Overlays / HUD** — vignette, scanlines, letterbox, caption, SKIP, and the REPLAY / view-toggle controls (decide which of these ship vs. are prototype-only debug affordances).
9. **Enter flow** — unchanged pattern (step on pad -> teaser -> `router.push`), pads just relocate. Projects requires the walk-around to the right-side pad by design.

## Risks

- **Perf / mobile.** The world already animates many elements; the POIs add a lot of always-animating absolutely-positioned divs plus `backdrop-filter` blur. On mobile this could jank. Mitigations: pause off-screen animations, respect reduced-motion (prototype already does for the intro), consider `content-visibility`. Worth a perf pass as its own step.
- **Camera correctness.** Zoom + clamp + a scripted path is the fiddliest math; most fidelity bugs will live here.
- **Fidelity drift.** Kenny's recurring pain. Acceptance checklist above is the guard; run a side-by-side audit before calling done.

## Decisions (locked with Kenny)

1. **Camera: cinematic zoom, then 1:1 gameplay.** The intro plays scaled/zoomed (movie feel); at the landing it hands off to the current 1:1 follow-cam so walking feels exactly like today.
2. **Traffic: 6 simple cars on the straight arterial for V1.** Do NOT delete the richer engine (traffic lights, nodes, car-following) — keep that code but divorce it from V1's arterial cars so it is dormant, ready groundwork for V2 curved-road path-following cars. V1 ships only the 6 ambient arterial cars.
3. **Intro: plays on every entry to the city.** On refresh or re-entering `/city`, the cinematic replays. No "remember where they came from" logic (we don't track entry origin; that's fine). Effectively: play the intro on every mount of the city page. It's short. Revisit later if it grates.
4. **View toggles: dropped.** FULL MAP / ARRIVAL toggles, the dashed drop-in frame, and the "ARTERIAL V1 TRAFFIC" tag were designer debug affordances — not shipped. Ship only the intro + gameplay camera.

## Proposed phased plan (recommendation)

Phased, each phase independently verifiable in the live app, so drift is caught early and Kenny can review at seams.

- **Phase 0 — Geometry cutover.** Rewrite `cityData.ts` to Layout C coords, move SPAWN to the landing, rebuild `SOLIDS`. Reposition existing destination rendering. No new visuals yet. Result: the current playable city, new layout, walkable, teasers work. Lowest risk, unblocks everything.
- **Phase 1 — World reskin.** Curved streets, one arterial, district blobs/labels, pavilion, all POIs + gray shells, tokens/overlays (vignette, scanlines). Static beauty pass. Fidelity audit vs checklist here.
- **Phase 2 — Rail + ambient train + traffic split.** Curved rail render + path-following train state machine (in/dwell/out/away) in the existing loop; trains arrive at random intervals. Also here: split traffic — ship the 6 simple arterial cars, and divorce (keep dormant, do not delete) the richer lights/nodes/car-following engine as V2 groundwork.
- **Phase 3 — Cinematic intro + handoff.** Scripted camera follow (zoom), letterbox, captions, scripted avatar walk-down, SKIP, reduced-motion fallback, then hand control to the player at the landing with the 1:1 follow-cam. Intro plays on every city mount. This is the camera-model work; do it last, on top of a known-good world.
- **Phase 4 — Perf + fidelity audit.** Mobile pass, off-screen animation pausing, side-by-side audit, fix deltas.
- **V2 (later, separate).** Migrate cars to path-following so the arterial can curve and more trafficked streets can be added. Enterable Pixel Pier / Fairgrounds. Gamification.
