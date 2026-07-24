# Designer Mockup Inventory — Neon City v3 (2026-07-23)

Source: `~/Downloads/design_handoff_neon_city_v3/Neon City v3.dc.html` (+ README).
Compared against: `src/lib/cityData.ts` (production) and `docs/superpowers/specs/2026-07-22-city-buildings-design.md` (brief).
All coords are world-space px unless marked mall-relative. Implementation reference — numbers are verbatim from the mockup.

---

## A. World & map-wide changes vs current cityData.ts

### World / camera / spawn

- **World: 3200×1600** (prod: 2400×1600). Grown 800px east for the Galleria district.
- **Spawn unchanged: (757, 714)** — on the new footbridge, east of the rail platform.
- Movement clamp: `cx ∈ [26, 3092]`, `cy ∈ [26, 1574]`. Note x-max is **3092, not 3174** — deliberate, keeps the player out of the marina water (marina starts x 3108). Side effect: the 28px strip between the mall's east wall (x 3080) and the marina is unreachable (see Jank F-10).
- Camera, street mode: `scale = min(vw/1500, vh/860)` capped at **1.15**; clamped to world edges. Fast-travel transition `transform .95s cubic-bezier(.6,.05,.3,1)`.
- Camera, overview mode: fit **3280×1680** (world + 80 margin), transition `1.2s cubic-bezier(.55,0,.2,1)`.
- Background: `#0a0913` + 60px grid lines `rgba(120,110,200,.04)`.

### Streets — curved SVG paths (replaces prod ROADS_H/ROADS_V grid)

Prod has straight `ROADS_H=[360,1040]` / `ROADS_V=[320,1880]`. The mockup keeps ONE straight arterial (y 320) and replaces everything else with 6 curved SVG paths, each drawn in 3 layers:

1. casing `rgba(150,140,220,.13)`, width 68 (60 for the two short spurs), `stroke-linecap:round`
2. asphalt `#0d0c17`, width 64 (56 for spurs)
3. center dash `rgba(243,237,226,.05)`, width 2, `stroke-dasharray:24 40` — **missing on spur path #5** (minor jank)

The 6 `d` strings (verbatim):

```
P1 (west N–S):   M 250 340 C 210 560 300 660 285 830 C 270 1010 430 1090 490 1260 C 540 1400 490 1500 510 1600
P2 (east N–S):   M 1880 340 C 2010 420 2100 480 2085 700 C 2075 880 1990 960 1900 1050 C 1800 1150 1690 1190 1560 1270 C 1420 1360 1330 1420 1310 1600
P3 (south E–W):  M 412 1130 C 680 1098 950 1128 1250 1128 C 1470 1126 1700 1096 1900 1040
P4 (north loop): M 252 -40 C 262 20 292 62 320 100 C 700 240 1150 120 1500 190 C 1720 230 1850 140 2010 130 C 2080 127 2120 200 2120 282
P5 (spur, park→arterial): M 1010 340 C 1030 430 1070 490 1090 556   (width 60/56, no dash layer)
P6 (spur, P2→Galleria):   M 2085 700 C 2220 688 2350 700 2500 702   (width 60/56, has dash layer)
```

- **Roundabout**: circle at `(1090, 548)` r 42, fill `#0d0c17`, stroke `rgba(150,140,220,.13)` w2 — where spur P5 meets the park area.
- **Arterial (kept straight, y 320)**: road band `M 0 320 L 3200 320` `#0d0c17` width **78**; edge lines at y 282 and y 358, `rgba(150,140,220,.14)` w1.5; center dash at y 320, `rgba(243,237,226,.08)` w2 `dasharray 26 36`. Ground label `ARTERIAL · V1 TRAFFIC` at (60, 270), JetBrains Mono 11px ls .24em `rgba(150,140,220,.4)`.
- **Crosswalks** (2, new): 46×72 zebra blocks (`repeating-linear-gradient(0deg, rgba(243,237,226,.1) 0 8px, transparent 8px 19px)`) at **(986, 284)** and **(2440, 284)** — both across the arterial.

### Rail (Adkins Line)

- `railD` is **identical to prod `RAIL_PATH`** — no change:
  `M 720 1660 C 750 1480 800 1420 770 1300 C 745 1195 600 1170 590 1030 C 583 930 680 905 680 810 L 680 480 C 680 330 640 260 560 200 C 470 130 380 80 320 -40`
- Rendering is 5 strokes: a blur(4px) shadow path (same shape offset ~+14x/+22y: `M 734 1682 …`), guideway `rgba(120,110,210,.14)` w22, rail bed `rgba(150,140,220,.45)` w13, center `#0d0b18` w7, tie dashes `rgba(150,140,220,.3)` w13 `dasharray 3 15`. SVG at **z-index 14**, `overflow:visible`.
- Platform: (696, 560) 36×250, `#131120`, z 15, vertical text `TERMINAL · ADKINS LINE` (cyan .75).
- Train stop-finding: walk the path in 4px steps; stop at first point where `|x−680|<3 && y≤602`.
- Train loop (unchanged concept): 3 cars 26×54, front offset −27, spacing 62; `in` 8000ms ease-in-out → `dwell` 3500+rand(2500)ms → `out` 3800ms ease-in to `L+280` → `away` 9000+rand(14000)ms. Cars: cyan gradient `linear-gradient(90deg, oklch(0.55 0.09 190), oklch(0.34 0.06 190))`, border `oklch(0.8 0.12 190 / .7)`, glow, window stripes; end cars get rounded noses (`10px 10px 5px 5px` / `5px 5px 10px 10px`), z 16.

### Terminal Park

- Same footprint: (900, 560) 660×450, radius `190px 70px 210px 90px`. Interior redesigned: 4 path bars (rot ±4–9°), a plaza circle (399,159) 88×88 dashed, a **pond** (420,24) 90×90 blue radial, label `TERMINAL PARK` bottom-right.
- **Prod's park `platform` (1110, 874, 240×32) is gone.**
- **Nameplate moved**: "Kendall Adkins / engineer by day · human by design" now a 280×100 flex block at **(1090, 700)** (prod nameplate anchor: 1230, 750). Name is Libre Caslon 30px + Instrument Serif italic, `nc-flick 9s`.

### Marina — MOVED to east edge

- Water strip: **(3108, 570) 92×560**, radius `80px 0 0 90px`, blue radial, dashed left border `rgba(140,190,235,.25)`.
- Docks: (3055, 700) 64×12 and (3050, 930) 70×12; buoy (3148, 800) 11×20 cyan-bordered `nc-pulse 4s`; label `MARINA` at (3042, 1046), cyan flick.

### Removed / added / moved structures

- **REMOVED: Projects pavilion** (prod destination `projects` at 780,640,150×260) — role replaced by the Galleria; a small kiosk stands near the mall instead (§B).
- **REMOVED: park platform** (1110,874).
- **MOVED: construction site** (1660,36) → **(1655, 10)** 170×100, rot 1.4°, now labeled **SITE 09** (striped top bar, crane mast+jib+cable+pulsing load, small shed).
- **MOVED: observatory** (2140,30) → **(2140, 14)** 150×150.
- Unchanged POIs: museum (520,12,180×96 — banner added), arcade (40,410,140×115 — upgraded), broadcast tower (2050,1150,130×130 `KNDL FM`), ramen (590,1345,140×95), night market (visual 1450,1380; solid 1450,1402,200×88), Pixel Pier gate (SW, ~70,1210 dashed blob + gate at 100,1300 with ferris wheel `nc-fan 22s`).
- **README note**: alleys removed ("looked bad").

### Shells — full new array (13; only 4 unchanged from prod)

```js
shells = [
  { x: 1030, y: 215, w: 170, h: 58, rot: 0, br: "10px 6px 8px 6px" }, // NEW (north band, slim)
  { x: 1225, y: 218, w: 145, h: 56, rot: 0, br: "6px 9px 6px 8px" }, // NEW
  { x: 1395, y: 224, w: 150, h: 52, rot: 0, br: "8px 6px 10px 6px" }, // NEW
  { x: 2336, y: 190, w: 120, h: 85, rot: 2, br: "12px 6px 16px 8px" }, // moved (was 2250,195)
  { x: 2160, y: 385, w: 140, h: 55, rot: 1.8, br: "10px 18px 8px 14px" }, // NEW (was 60,185 gone)
  { x: 1600, y: 390, w: 130, h: 100, rot: 1.1, br: "6px 15px 8px 12px" }, // kept
  { x: 120, y: 1080, w: 130, h: 95, rot: -1.6, br: "15px 7px 19px 9px" }, // kept
  { x: 2200, y: 1145, w: 120, h: 80, rot: -1.4, br: "8px 13px 6px 17px" }, // moved (was 2190,1120 rot 1.4)
  { x: 2010, y: 1358, w: 150, h: 105, rot: 178.8, br: "17px 8px 13px 7px" }, // moved + FLIPPED 180°
  { x: 1750, y: 1300, w: 120, h: 90, rot: 2.1, br: "9px 16px 7px 13px" }, // kept
  { x: 900, y: 1475, w: 160, h: 95, rot: -0.8, br: "13px 6px 18px 9px" }, // kept
  { x: 2705, y: 1152, w: 150, h: 100, rot: 181.3, br: "14px 7px 18px 8px" }, // NEW + flipped
  { x: 2915, y: 1272, w: 120, h: 85, rot: -1.5, br: "8px 15px 7px 12px" }, // NEW
];
```

Dropped prod shells: (110,60), (900,40), (1050,202), (1360,205), (60,185), (1250,420). Shell chrome unchanged (window block top-left 34×24, vent dot bottom-right).

### District labels (5 — one added, letter-spacing .5em)

```
NORTH GRID          (640, 218)  13px  rgba(150,140,220,.3)
DOCKSIDE            (2035,1030) 13px  rgba(140,190,235,.34)
FAIRGROUNDS         (150, 1240) 13px  rgba(220,140,220,.3)
THE LANDING         (500, 878)  11px  rgba(150,140,220,.32)
GALLERIA DISTRICT   (2640,1108) 13px  rgba(140,220,210,.32)   ← NEW
```

### Blobs (5 — one added)

Prod's 4 unchanged, plus: `{ x: 2380, y: 380, w: 780, h: 760, rot: 1, br: '44% 42% 46% 43%', bg: 'rgba(140,200,235,.03)' }` (Galleria district wash).

### Trees (26 — prod's 20 kept, 6 added), format = top-left + diameter `s`

Prod stores center+radius; the mockup's `(x, y, s)` maps to prod's `(x+s/2, y+s/2, s/2)` — all 20 prod trees verified identical. **Added:**

```
{ x: 790,  y: 660,  s: 26 }  { x: 830,  y: 760, s: 22 }   // park west, near footbridge
{ x: 2400, y: 880,  s: 26 }  { x: 3010, y: 1160, s: 22 }  // galleria district
{ x: 2720, y: 320,  s: 24 }  { x: 2350, y: 480, s: 22 }
```

### Lamps (9 — prod's 5 kept, 4 added)

Added: `(2480,660) (2540,840)` (mall approach), `(2900,300)` (diner/water-tower), `(1210,292)` (arterial). Glow radius formula: `0.04 + 0.09*(1−dayness)`.

### Benches (6 — prod's 5 kept, 1 added)

Added: `{ x: 1008, y: 1036, w: 46, h: 14, g: '0deg' }` — beside the taco truck; an 8px sphere prop at (1014,1042) sits ON it (the "bench-sitter" from the brief; non-collidable).

### Footbridge "TERMINAL WALK" (new)

- (730, 706) **184×38**, z 13, `pointer-events:none`, **no collider** (walk-through corridor; spawn sits on it).
- Deck `#1a1526` radius 3, plank texture `repeating-linear-gradient(90deg, rgba(214,178,120,.16) 0 3px, transparent 3px 12px)`; top/bottom rails 3px `rgba(214,178,120,.35)` offset −3px; 4 posts 4×8 at 24px from each end; 2 pulsing lamp dots top corners (delay 1.6s stagger); centered label `TERMINAL WALK` 6px ls .3em.
- Spans from the rail platform's east edge (x 732) to the park edge. The platform itself IS solid, so the bridge dead-ends against it — it's a visual connector (README: built for a future walk-through animation).

### Traffic (cars now fully specified; prod has only the `Car` type)

8 cars, two lanes on the arterial: eastbound lane y 301 (v 2.3, 2.05, 2.5, 2.2 at x 120/760/1600/2500; hues 190/46/340/300), westbound lane y 339 (v −2.2, −2.35, −2.45, −2.0 at x 2900/2100/1240/420; hues 300/190/190/46). Car: 34×15 r4, `linear-gradient(180deg, oklch(0.55 0.09 h), oklch(0.34 0.06 h))`, glow `oklch(0.8 0.14 h / .45)`, rendered at `lane − 7.5`; wrap at x > 3240 / < −40.

---

## B. The Galleria

### Shell geometry

- **Origin MX=2560, MY=430; footprint 520×620** (world 2560–3080 × 430–1050).
- Courtyard floor: `inset:16px`, `#0e0c18` + 34px grid lines.
- Walls (`#1a1630`, border `oklch(0.85 0.13 190 / .35)`, all 16px thick, mall-relative):
  - N: (0,0) 520×16 · S: (0,604) 520×16 · E: (504,0) 16×620
  - W upper: (0,0) 16×260 · W lower: (0,350) 16×270
  - **Entrance gap = west wall, mall-y 260–350 → world y 690–780** (90px opening).
- Entrance glow strip: mall (−2, 260) 6×90, solid cyan `oklch(0.85 0.13 190)`, `box-shadow 0 0 18px`, opacity .85.
- Nameplate: `✦ THE GALLERIA` centered above at top:−24, 12px ls .34em cyan, `nc-mflick 7s`, **z 13** (above roof).
- District apron: (2470, 620) 80×180 world, r8, `rgba(150,140,220,.05)` + dashed border — dashed forecourt outside the entrance.
- Ground label `GALLERIA DISTRICT` at (2640, 1108) (§A).

### Courtyard dressing (mall-relative; ✓ = in `_solids`)

- Fountain ✓: (204,254) 52×52 dashed blue circle, inner `nc-ring 3s` ripple.
- Directory ✓ (solid is 26×44 vs visual 26×40): (100,270) 26×40, cyan screen lines, red dot; caption `YOU ARE HERE` at (88,314) 5.5px.
- Benches ✓: (150,450) 46×14 and (320,200) 14×46 (wood style).
- Vendor cart ✓ (solid 36×30 at y324 covers awning): (300,330) 36×24 + striped awning at top:−6.
- Planter trees ✗ NOT collidable (render-only): (140,160) 16px, (360,470) 16px, (230,410) 14px.

### Roof + iris animation

- Roof container: `inset:0`, **z-index 12**, `pointer-events:none`, `overflow:hidden`; driven by `opacity:{roofOp}`, `clip-path:{roofClip}`, transition `opacity .9s ease, clip-path 1s cubic-bezier(.6,0,.3,1)`.
- Inside it, TWO halves (left 260×620 at x0; right 260×620 at x260, `border-left:none`, `overflow:hidden`), each `#161327`, border `rgba(150,140,220,.45)`, dashed seam on the left half's right edge. Each half contains a full 520×620 surface (right half offset −260) so the artwork spans the seam. Halves have `transform:{roofL}/{roofR}`, transition `transform 1.1s cubic-bezier(.65,0,.25,1)`.
- Variant logic (`lift = props.roofLift ?? 'split'` — **note code fallback 'split' but declared default 'iris'**):
  - `iris`: `roofClip = open ? 'circle(0% at 50% 50%)' : 'circle(75% at 50% 50%)'` (halves static)
  - `split`: `roofL/roofR = open ? translateX(∓101%) : translateX(0)`
  - `fade`: `roofOp = open ? 0 : 1`
- **Open trigger** (evaluated every frame in renderVals):
  - `inside = cx ∈ (MX+16, MX+504) && cy ∈ (MY+16, MY+604)`
  - `nearGap = cx ∈ (MX−60, MX+40) && cy ∈ (MY+240, MY+370)` → world x 2500–2600, y 670–800 (covers the galleria pad)
  - `open = inside || nearGap`. Restore is automatic — walk out of both zones and the same transition reverses. No state, no hysteresis.
- Roof surface (`surf = props.roofSurface ?? 'skylights'` — **declared default 'billboard'**), each variant duplicated in both halves:
  - `skylights`: 3 frosted-blue rounded strips 400×60 at y 70/280/490; 44px HVAC fan box top-right; small pink ad box bottom-left showing `{roofAdTop}/{roofAdSub}`.
  - `hvac`: two 80×80 fan boxes, 70×140 vent grille, dashed helipad-ish square, hazard-striped duct, red pulse dot.
  - `billboard` (chosen): 300×120 panel at (110,150) — `#0d0b18`, pink border `oklch(0.75 0.16 340 / .6)`, 30px glow, `nc-mflick 8s`; text `{roofAdTop}` 16px ls .3em in `{roofAdAc}` + `{roofAdSub}` 9px; 2 support posts 4×60 below; 44px box bottom-left. **Content = same rotating ad pool as the street billboards** (§D), synced to the same 6s clock.
  - `logo`: giant rotated −90° `GALLERIA` (Libre Caslon 74px, `rgba(243,237,226,.14)`) + `EST. 2026` + corner box.

### Kiosk (old pavilion nod)

- (2410, 560) 90×80 world, radius `14px 8px 12px 8px`, `rgba(17,15,30,.94)`, cyan border+glow, 4 corner squares 6×6; centered text `KIOSK` 8px + `( PURPOSE TBD )` 6px. Collidable. No pad, no teaser.

### Units — full list (14: 9 live, 2 construction, 3 for-lease)

Mall-relative `rx/ry`; world = `(MX+rx, MY+ry)`. `d` = district → hue: sports 46, games 340, tools 190, client 300 (applied only when `unitStyle==='district'` && live; otherwise hue 190; non-live units always dimmed `oklch(0.85 0.05 h / .8)`).

| key         | name / project slug                              | code | status | anchor  | rx,ry   | w×h    | face | district(hue) | blurb (teaser copy)                                                                        |
| ----------- | ------------------------------------------------ | ---- | ------ | ------- | ------- | ------ | ---- | ------------- | ------------------------------------------------------------------------------------------ |
| u-loresmith | Loresmith / `loresmith`                          | N-01 | live   | **yes** | 36,22   | 132×64 | S    | games(340)    | "Worldbuilding toolkit for tabletop storytellers — the anchor tenant."                     |
| u-saul      | Saul / `saul`                                    | N-02 | live   | no      | 188,22  | 88×64  | S    | tools(190)    | "Legal-ops automation that reads the fine print so you don't."                             |
| u-media     | The Score Media / `the-score-media`              | N-03 | live   | no      | 288,22  | 88×64  | S    | sports(46)    | "Sports media at broadcast speed."                                                         |
| u-con1      | SIGNAL (placeholder)                             | N-04 | con    | no      | 388,22  | 88×64  | S    | tools         | permit `№ 0114 · SIGNAL`; blurb "Permit № 0114 — something's going up behind the plywood." |
| u-ricochet  | Ricochet Rogue / `ricochet-rogue`                | E-01 | live   | no      | 440,110 | 64×80  | W    | games(340)    | "A card-slinging roguelike. The cabinet across town runs the demo."                        |
| u-vantage   | Vantage / `vantage`                              | E-02 | live   | no      | 440,210 | 64×80  | W    | tools(190)    | "Observability with opinions."                                                             |
| u-lease1    | FOR LEASE                                        | E-03 | lease  | no      | 440,310 | 64×80  | W    | —             | "Prime courtyard frontage. Room for the next project."                                     |
| u-lease2    | FOR LEASE                                        | E-04 | lease  | no      | 440,420 | 64×80  | W    | —             | "Corner unit, good light, zero tenants. Yet."                                              |
| u-diggs     | Diggs Johnson Museum / `diggs-johnson-museum`    | S-01 | live   | no      | 36,534  | 88×64  | N    | client(300)   | "Digital home for a living archive — the exhibition is hanging across town."               |
| u-clock     | On the Clock / `on-the-clock`                    | S-02 | live   | no      | 136,534 | 88×64  | N    | tools(190)    | "Shift scheduling without the spreadsheet." ⚠ wrong (see F-1)                              |
| u-lease3    | FOR LEASE                                        | S-03 | lease  | no      | 236,534 | 88×64  | N    | —             | "Inquire within — the landlord is friendly."                                               |
| u-scorebet  | The Score Bet / `the-score-bet`                  | S-04 | live   | **yes** | 340,534 | 132×64 | N    | sports(46)    | "Real-time odds, zero jank — end-cap anchor unit."                                         |
| u-arbutus   | Arbutus Rec Center / `arbutus-recreation-center` | W-01 | live   | no      | 22,110  | 64×80  | E    | client(300)   | "A community hub's digital front door."                                                    |
| u-con2      | FIELDBOOK (placeholder)                          | W-02 | con    | no      | 22,400  | 64×80  | E    | games         | permit `№ 0126 · FIELDBOOK`; blurb "Permit № 0126 — fresh scaffolding, big plans."         |

Unit rendering:

- Box `#131120`, r3; live: border `oklch(0.85 0.13 h / .45)`, glow `.14`; dim (con/lease): border `rgba(150,140,220,.3)`, glow `rgba(0,0,0,.4)`.
- **Sign**: live → `NAME.toUpperCase()` 6.5px ls .14em in accent with text glow; con → `UNIT <code>`; lease → empty.
- Anchors get an extra `ANCHOR` sub-label (5px ls .2em, `rgba(243,237,226,.4)`).
- **Door strip** on the facing side: S `(w/2−10, h−4, 20×4)`, N `(w/2−10, 0, 20×4)`, W `(0, h/2−10, 4×20)`, E `(w−4, h/2−10, 4×20)`; accent bg + glow; opacity `.9` live / `.25` otherwise.
- **Construction overlay**: full-unit 45° caution stripes `repeating-linear-gradient(45deg, oklch(0.8 0.12 46 / .22) 0 7px, rgba(14,12,25,.85) 7px 14px)` + centered cream **building-permit board** (`#e8dcc2`, text `#3a3020`, border `#9a8a60`): "BUILDING PERMIT / {permit}".
- **For-lease overlay**: dark scrim `rgba(10,9,19,.55)` + rotated −4° placard `FOR LEASE / INQUIRE WITHIN`.
- **Glyphs** (only shown when `unitStyle==='motif'` && live): loresmith ✦(✦), saul §, media ◉, ricochet ♦(♦), vantage ▲, diggs ◫(◫), clock ◔, scorebet ◈, arbutus ✚(✚).

### Unit pad derivation (`_unitPad`, mall-relative; every unit gets one, incl. con/lease)

```js
S: { x: rx + w/2 − 24, y: ry + h + 5,   w: 48, h: 30 }
N: { x: rx + w/2 − 24, y: ry − 35,      w: 48, h: 30 }
W: { x: rx − 39,       y: ry + h/2 −24, w: 34, h: 48 }
E: { x: rx + w + 5,    y: ry + h/2 −24, w: 34, h: 48 }
```

Pad visual: accent border, bg `oklch(0.85 0.13 h / .12)`, r3, `nc-pulse 2.4s`. Pads are registered in `_padList` in world coords (`MX+px, MY+py`).

### Unit teasers (generated in `_teaserFor`)

- live: kicker `THE GALLERIA · UNIT <code> · <SPORTS|GAMES|TOOLS|CLIENT WEB>`, title `<Name>.`, blurb from unitData, cta `> visit <slug>`, href `Project Detail.dc.html` (stand-in).
- con: hue 46, kicker `THE GALLERIA · UNIT <code> · PERMIT POSTED`, title `Coming soon.`, **no CTA** (`none:true`).
- lease: hue 190, kicker `THE GALLERIA · UNIT <code> · VACANT`, title `For lease.`, cta `> dispatch an inquiry`, href `mailto:kendall@adkins.dev`.

---

## C. New / changed buildings (position, size, key visuals, label, pad?)

Common vocabulary: every building has the 8px-inset faint window grid; hanging label = JetBrains Mono 10px ls .28em, accent color + glow, `#0a0913` chip, `bottom:-13px` centered, `nc-flick` at varied durations (6.5–9.6s so flickers desync). Rooftop sign = 8–9px mono, `nc-mflick`. HVAC fan = conic-gradient quarter circle in a box, `nc-fan` (varied durations, some `reverse`).

- **THE STACKS (library)** — (60,70) 180×115, r6, `#141021`, amber border. 3 columns (8×44) along the bottom edge; book-spine window top-left (70×24, 8 colored 4px spines at varied heights); warm-glow window top-right (52×24 amber gradient); HVAC fan box (22px); `RETURN SLOT` 22×7 dark slot + 5.5px caption. Label `THE STACKS` (amber). Pad: destPads `stacks` (120,204) 60×34. Teaser hue 46.
- **MUSEUM (banner added)** — (520,12) 180×96, rot −1.2°, unchanged shell + amber accents; NEW centered banner text `THE DIGGS JOHNSON\nCOLLECTION` 7.5px amber `nc-mflick 9s` with 2 banner poles (2×26); steps at bottom; pulse dot. Label `MUSEUM`. NEW pad: `museum` (470,30) 36×60 (west side). Now a destination.
- **THE MARQUEE (theater)** — (880,5) 220×125, r8, pink border. Marquee box (14,12→right, 40h): twin chase-light rows (2px repeating dashes, `nc-mflick` 6s/7.3s), `NOW SHOWING` 6.5px + `{marqueeNow}` 8.5px pink glow (data-driven changelog). Two poster cases 30×40 flanking (gradient posters, no artwork); door 20×32; HVAC fan (reverse); second door. Label `THE MARQUEE`. Pad: `theater` (1105,40) 36×60 (east side). Teaser title = marqueeNow.
- **ADKINS SUPPLY CO. (merch)** — (1205,8) 190×115, radius `6px 14px 6px 10px`, pink. Display window 110×54 with **2 procedural tee shapes** (clip-path polygon, 30×34, chest print blocks pink/cyan); **`OPENING SOON` paper overlay** 98×42 rot −2° dashed cream over the window; door 34×54 with pink transom light; rooftop sign `ADKINS SUPPLY CO.` 9px pink `nc-mflick 5.8s`. Label `MERCH`. Pad: `merch` (1400,30) 36×60 (east). Teaser `soon:true`.
- **SITE 09 (construction, moved)** — (1655,10) 170×100, rot 1.4°, dashed amber border, striped hazard top bar (8px, 45° amber stripes), crane (mast 4×70, jib 78×4, cable 1×26, load 9×7 `nc-pulse 2.8s`), shed 30×18. Label `SITE 09`. No pad.
- **OBSERVATORY (moved + promoted)** — (2140,14) 150×150, lavender. 90px dome with rotated 18° aperture slit; pulse dot. Label `OBSERVATORY`. NEW pad: `observatory` (2296,60) 36×66 (east). Teaser = "currently learning".
- **ARCADE (upgraded)** — (40,410) 140×115 unchanged geometry; NEW: attract-mode radial glow overlay (`nc-attract 3.2s`), 4 cabinets — one with pink border + **♦ card motif** (Ricochet Rogue), HVAC fan. Label `♦ ARCADE ♠`. NEW pad: `arcade` (76,536) 60×34. Teaser → Ricochet Rogue.
- **GRIDLINE DINER** — (2450,140) 190×105, radius `14px 14px 6px 6px`, amber. Long window band (h26, amber gradient + mullions), cyan dashed trim strip below, HVAC fan + vent, rooftop `GRIDLINE DINER` 9px (no flick). **`OPEN 24HRS` sign** 58×16 red (`oklch(0.72 0.19 25)`): `dinerAnim` = `nc-dinerdie 2.6s linear infinite` when deepNight (dayness<0.06) else `nc-mflick 7s` — the half-dead-sign bit. Label `DINER`. No pad.
- **WATER TOWER** — (2870,120) 110×130 visual (solid 2878,128,94×100). 3 legs (4px, outer rot ±10°), tank 94×64 radius `50% 50% 42% 42%` with `ADKINS` 11px ls .3em; red aircraft light at top `nc-blink 2.2s step-end`. Caption `WATER TWR` (plain, dim). No pad.
- **THE DAILY GRIND (café)** — (1125,390) 140×95, amber. Two warm windows; rooftop **cup sign** (20×16 + handle) at top:−14 with 3 steam wisps (`nc-steam 2.8s`, delays 0/1/1.9s); 2 sidewalk tables (circles, left side, non-collidable); **`OPEN SOON` sandwich board** at (14, bottom −24) 20×22 trapezoid clip-path; rooftop text `THE DAILY GRIND` 8.5px. Label `CAFÉ`. Pad: `coffee` (1170,495) 60×36 (south). Teaser `soon:true`.
- **STRETCH.CSS (yoga)** — (1270,420) 130×100, lavender. Frosted window 76×56 with **3 pose silhouettes cycling via `nc-pose 9s`** (delays 0/−3/−6s: standing/warrior-lean/floor pose, built from head-circle + bar divs); `POSE OF THE DAY {poseOfDay}` mini-sign 22×30 trapezoid (4px text; poseOfDay = `['CROW','HALF MOON','WARRIOR II','TREE','PIGEON','EAGLE','LOTUS'][dayOfYear % 7]`); rooftop `STRETCH.CSS`. Label `YOGA`. No pad.
- **REPS & RENDERS (gym)** — (1430,410) 150×105, cyan. Dark window 80×60 with lifter silhouette doing **bicep curls** (forearm bar `nc-curl 1.6s` rot 10°→−58°, cyan dumbbell head); neon `24HR` box `nc-mflick 4.9s`; rooftop `REPS & RENDERS`. Label `GYM`. No pad.
- **SUDS CYCLE (laundromat)** — (1920,600) 140×90, cyan. Row of 4 washer portholes (24px circles); first 3 spin (`nc-fan` 4.2/5.6 reverse/4.8s conic sud-swirls), **4th is dark/idle** (broken washer gag). Rooftop `SUDS CYCLE`. Label `LAUNDROMAT`. No pad.
- **TACO PROCESS (food truck)** — (930,1030) 74×36 truck (gradient body, amber service window, 2 steam wisps, cab window, 2 wheels at bottom:−4). Floating sign `TACO PROCESS` at top:−22 amber `nc-mflick 5.4s`. Companion bench (1008,1036) + bench-sitter sphere (1014,1042). No pad.
- **FADE FUNCTION (barber)** — (1150,1265) 120×85, cyan. **Barber pole** at left:−9 (10×34, diagonal red/white/cyan stripes, `nc-pole 1.6s` background-position scroll); window 52×32; dashed `WALK-INS WELCOME` card 5.5px; rooftop `FADE FUNCTION`. Label `BARBER`. No pad.
- **MADAME ORACLE** — (1160,1390) 90×95. **Tent**: pentagon clip-path `polygon(50% 0, 100% 38%, 92% 100%, 8% 100%, 0 38%)`, purple gradient + lavender stripe overlay; glowing **crystal ball** 24px radial `nc-pulse 3.6s`; finial dot at peak. Label `MADAME ORACLE` (lavender). Pad: `oracle` (1256,1415) 34×56 (east). Teaser = fortune w/ reroll action.
- **BILLBOARDS ×3** — geometry `{x,y,w,h,post}`: **(2252,118) 116×58 post 26** · **(130,975) 130×60 post 36** · **(1748,1235) 124×58 post 16** (this one lands its posts on the shell at 1750,1300 — reads as rooftop-mounted). Frame `#0d0b18`, accent border + 20px glow, `nc-mflick 8s`, 2 posts (3px) below at 20% / 80%. Content rotates (§D). z 4. Non-collidable, no pads.

---

## D. Interaction data

### spotData (main destinations; pads are TOP-LEFT rects here, unlike prod's center-format)

```js
spotData = [
  {
    key: "resume",
    label: "ADKINS LINE",
    sub: "( resume )",
    x: 340,
    y: 430,
    w: 300,
    h: 230,
    hue: 190,
    br: "20px 7px 16px 9px",
    door: { x: 131, y: 224, w: 38, h: 6 },
    pad: { x: 455, y: 668, w: 70, h: 44 },
  },
  {
    key: "about",
    label: "UNIT 4B",
    sub: "( about )",
    x: 1640,
    y: 600,
    w: 270,
    h: 300,
    hue: 46,
    br: "9px 17px 7px 23px",
    door: { x: 1, y: 131, w: 6, h: 38 },
    pad: { x: 1584, y: 700, w: 44, h: 70 },
  },
  {
    key: "contact",
    label: "POST OFFICE",
    sub: "( contact )",
    x: 820,
    y: 1250,
    w: 300,
    h: 180,
    hue: 300,
    br: "18px 8px 24px 6px",
    door: { x: 131, y: 1, w: 38, h: 6 },
    pad: { x: 935, y: 1198, w: 70, h: 44 },
  },
];
// NOTE: no 'projects' entry — pavilion retired. Pad rects equal prod's center-based pads converted to top-left.
```

### destPads (new destinations; top-left rects)

```js
destPads = [
  { key: "galleria", hue: 190, x: 2500, y: 700, w: 48, h: 70 },
  { key: "merch", hue: 340, x: 1400, y: 30, w: 36, h: 60 },
  { key: "coffee", hue: 46, x: 1170, y: 495, w: 60, h: 36 },
  { key: "stacks", hue: 46, x: 120, y: 204, w: 60, h: 34 },
  { key: "arcade", hue: 190, x: 76, y: 536, w: 60, h: 34 },
  { key: "observatory", hue: 300, x: 2296, y: 60, w: 36, h: 66 },
  { key: "theater", hue: 340, x: 1105, y: 40, w: 36, h: 60 },
  { key: "museum", hue: 46, x: 470, y: 30, w: 36, h: 60 },
  { key: "oracle", hue: 300, x: 1256, y: 1415, w: 34, h: 56 },
];
```

Plus 14 auto-derived unit pads (§B). Pad visual: accent border, `oklch(0.85 0.13 h / .16)` bg, r4, `nc-pulse 2s`.

### Teaser copy — verbatim (kicker renders with `✦ ` prefix from template)

| key         | hue | kicker                                       | title                         | blurb                                                                                                         | cta                            | link                        |
| ----------- | --- | -------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------ | --------------------------- |
| resume      | 190 | NEON CITY TRANSIT · CAREER SERVICE           | Ride the line.                | Ten years, every station — from the retail floor to staff engineer, end to end. ⚠F-2                          | > ride the line                | `Resume Page.dc.html`       |
| about       | 46  | NEON CITY HOUSING · UNIT 4B                  | Come on in.                   | The human one — the origin story, the shelf of hobbies, shoes off at the door.                                | > knock on 4B                  | `About Page.dc.html`        |
| contact     | 300 | NEON CITY POST OFFICE · DISPATCH DESK        | Drop a letter.                | A role, a project, or a good reason to say hi — the desk is always staffed.                                   | > mail kendall@adkins.dev ⚠F-3 | `mailto:kendall@adkins.dev` |
| galleria    | 190 | THE GALLERIA · 14 UNITS · ROOF LIFTS FOR YOU | Every project under one roof. | Anchor tenants, fresh building permits, and a couple of FOR LEASE signs. Walk in — the roof knows what to do. | > browse all projects          | `Projects Page.dc.html`     |
| merch       | 340 | NEON CITY RETAIL · SOFT OPENING              | Wear the city.                | Shirts and other goods, made by the guy who made this place.                                                  | > browse the racks             | soon                        |
| coffee      | 46  | NEON CITY CAFÉ · TIPS WELCOME                | Buy me a coffee.              | Fuel for the next project. The espresso machine is rendered in pure CSS.                                      | > leave a tip                  | soon                        |
| stacks      | 46  | NEON CITY ARCHIVE · STACKS OPEN LATE         | The stacks.                   | Field notes from the studio — what got built and what it taught me.                                           | > browse the stacks            | `#`                         |
| arcade      | 190 | NEON CITY ARCADE · FREE PLAY                 | One more run.                 | Ricochet Rogue — a card-slinging roguelike. The cabinet's warmed up.                                          | > insert coin                  | `Project Detail.dc.html`    |
| observatory | 300 | NEON CITY OBSERVATORY · SKIES CLEAR          | Pointed at what's next.       | Currently studying: building AI agent workflows. The lens gets refocused every few months.                    | > look through the lens        | `#`                         |
| theater     | 340 | NEON CITY CINEMA · NOW SHOWING               | `{marqueeNow}`                | The marquee doubles as the changelog — whatever shipped last gets the big screen.                             | > see what shipped             | `Project Detail.dc.html`    |
| museum      | 46  | NEON CITY MUSEUM · CURRENT EXHIBITION        | The Diggs Johnson Collection. | A wink across town — the museum project, hanging in the museum.                                               | > tour the exhibit             | `Project Detail.dc.html`    |
| oracle      | 300 | MADAME ORACLE · CRYSTAL WARM                 | Your fortune.                 | `fortunes[fortune % 7]`                                                                                       | > another fortune              | action: reroll              |

Unit teasers: §B. Teaser panel: bottom-left 300px card, corner brackets `nc-mflick`, × close (sets `_dismissed`), Enter follows href, Esc dismisses. `soon` renders CTA as dashed `"{cta} · OPENING SOON"` chip; `none` renders no CTA.

### Billboard rotation (6s cycle, offset per board so all 3 differ; roof billboard shows `ads[adIdx % 3]`)

```js
ads = [
  { hue: 340, top: "WEAR THE CITY", sub: "ADKINS SUPPLY CO. · SOFT OPENING" },
  { hue: 190, top: "ONE MORE RUN", sub: "THE ARCADE · FREE PLAY" },
  { hue: 46, top: "OPENING SOON", sub: "THE DAILY GRIND · TIPS WELCOME" },
];
adIdx = Math.floor(Date.now() / 6000); // board i shows ads[(adIdx + i) % 3]
```

### Madame Oracle fortune pool (7, verbatim)

1. It works on my machine — and my machine is the cloud.
2. A refactor delayed is a refactor doubled.
3. You will meet a tall, dark stack trace.
4. The ball says: cache invalidation. It always says that.
5. FACT: Kenny's espresso machine is rendered in pure CSS.
6. Commit early, commit often, push before the demo.
7. Beware the Friday deploy. The stars are misaligned.

Reroll: `fortune = (fortune + 1 + floor(random()*(len−1))) % len` — guaranteed different from current.

### Tweak defaults (DC props)

| prop            | default                   | options/range                            | code fallback if unset      |
| --------------- | ------------------------- | ---------------------------------------- | --------------------------- |
| roofLift        | **iris**                  | split / fade / iris                      | `'split'` ⚠F-6              |
| roofSurface     | **billboard**             | skylights / hvac / billboard / logo      | `'skylights'` ⚠F-6          |
| unitStyle       | **district**              | district / motif / uniform               | `'district'`                |
| marqueeNow      | `Vantage — shipped 07.26` | text                                     | same (uppercased on render) |
| walkSpeed       | 4                         | 2–8 step .5 (px/frame @60fps, dt-scaled) | 4                           |
| traffic         | true                      | bool                                     | true                        |
| dayNightMinutes | 4                         | 1–12                                     | 4                           |

### Quick-nav stations (bottom bar; fast-travel = teleport to pad center + 1s cam ease, then open teaser)

`~/overwatch` (→ designer's home file, hardcoded ⚠F-4) · `galleria/` (190) · `resume/` (190) · `about/` (46) · `contact/` (300) · `arcade/` (190) · `stacks/` (46).

### Day/night + HUD

`dayness = 0.5−0.5cos(2πt)`; phase: NIGHT <0.22, DAY >0.72, else DAWN (t<.5) / DUSK; deepNight <0.06. `dayOpacity = dayness*0.34` on a screen-blend gradient `linear-gradient(180deg,#6d7bb4,#96938f)`; vignette + 4px scanlines static. HUD clock `hour24 = t*24`; sky dot `#f2d98c` day / `#aab4e8` night / `#e8a97c` dawn-dusk. Movement: WASD/arrows/click-to-walk, diagonal ×0.72, Enter opens pad panel / follows link, Esc dismisses (pad stays dismissed until you leave it).

---

## E. Solids / collision

`_solids` = AABBs (player circle r=13 vs rect; axis-separated so you slide along walls). Construction order:

1. `spotData` boxes (3 destinations).
2. All 13 `shells` (unrotated AABBs — rotation ignored for collision, incl. the 178.8°/181.3° flips).
3. Bespoke buildings (comment names verbatim):

```
stacks(60,70,180,115) museum(520,12,180,96) theater(880,5,220,125) merch(1205,8,190,115)
site09(1655,10,170,100) observatory(2140,14,150,150) arcade(40,410,140,115) coffee(1125,390,140,95)
yoga(1270,420,130,100) gym(1430,410,150,105) laundromat(1920,600,140,90) diner(2450,140,190,105)
watertower(2878,128,94,100)  ← tighter than the 110×130 visual (legs only)
broadcast(2050,1150,130,130) ramen(590,1345,140,95) nightmarket(1450,1402,200,88)
barber(1150,1265,120,85) oracle(1160,1390,90,95) kiosk(2410,560,90,80) foodtruck(930,1030,74,36)
railplatform(696,560,36,250)
```

4. Mall walls (5 rects, gap preserved): `(M,MY,520,16) (M,MY+604,520,16) (M+504,MY,16,620) (M,MY,16,260) (M,MY+350,16,270)`.
5. Courtyard: fountain `(M+204,MY+254,52,52)`, directory `(M+100,MY+270,26,44)`, benches `(M+150,MY+450,46,14)` `(M+320,MY+200,14,46)`, cart `(M+300,MY+324,36,30)`.
6. All 14 unit boxes (`M+rx, MY+ry, w, h`).
7. All 6 world `benches`.

**Tree circles**: separate circular check `hypot(px−(t.x+s/2), py−(t.y+s/2)) < 13 + s/2` over the 26 `trees` (top-left + diameter format). Courtyard planter trees are NOT in the array → walk-through.

**Not collidable**: billboards, footbridge, Pixel Pier gate, marina, café tables/sandwich board, bench-sitter sphere, Taco Process sign, park interior, crosswalks, apron.

**Diffs vs prod `POI_COLLIDERS`** (7 entries): construction moved (1660,36)→(1655,10); observatory (2140,30)→(2140,14); museum/arcade/broadcast/ramen/night-market unchanged. Everything else in the list above is NEW collision. Prod's projects-pavilion collider goes away.

---

## F. Jank / issues noticed

1. **On the Clock blurb is wrong**: "Shift scheduling without the spreadsheet." OTC is Kenny's NFL-draft tracker, not a scheduling app. Symptom of a bigger issue: all 9 live-unit blurbs are designer-invented — the port should source name/blurb/slug/district from Keystatic project data, not hardcode.
2. **Resume teaser claims "staff engineer"** ("from the retail floor to staff engineer") — Kenny is a Senior SWE. Prod blurb ("A decade of engineering as a transit map…") was fine; don't ship this copy.
3. **`kendall@adkins.dev` email** in contact teaser + FOR LEASE inquiry mailtos — fabricated domain; prod routes to `/contact`. Also all hrefs are DC stand-ins (`Resume Page.dc.html`, `Project Detail.dc.html`, `Projects Page.dc.html`, `#` for stacks/observatory, `./overwatch-home/…` for quick-nav home) — every one needs remapping to real routes; arcade/theater/museum all point at the same generic `Project Detail.dc.html`.
4. **Quick-nav `home` hardcodes** the designer's `Overwatch Home.dc.html`; `travel()` special-cases the key.
5. **Roof-open zone (`nearGap`) is hardcoded** (`M−60…M+40 × MY+240…MY+370`) separately from both the wall-gap geometry and the galleria pad — three numbers that must agree but don't share a source. Same disease as the README's "positions live in TWO places (template + _solids)" — the whole mockup duplicates geometry between template and script.
6. **Default vs fallback mismatch**: declared defaults are `iris`/`billboard`, but code fallbacks are `?? 'split'` / `?? 'skylights'`. In DC the props always arrive so it's invisible; in the React port pick ONE source of truth or you'll ship the wrong roof.
7. **Shell overlaps diner**: shell (2336,190,120×85, rot 2°) right edge ≈2456 vs diner left edge 2450 — ~6px overlap (more with rotation). Also billboard #1 (2252,118)'s right post lands on that shell's corner. Billboard #3's posts land on shell (1750,1300) — that one reads as intentional rooftop mounting; the diner overlap doesn't.
8. **Pad/label collisions** (violating README's own "26px clearance below buildings" rule): resume pad (455,668) starts 8px below the building (label chip overlaps pad); coffee pad (1170,495) and arcade pad (76,536) each clip the hanging label by ~2–3px.
9. **Yoga–café gap is 5px** (café right edge 1265, yoga left 1270): visually separate buildings but an impassable slot that collision treats as one mass; fine, but pads/labels there will z-fight at street zoom. Yoga–gym gap is 30px — barely passable (player needs 26).
10. **Unreachable strip east of the Galleria**: mall east wall outer edge x 3080, x-clamp 3092, player radius 13 → no legal position; the corridor to the marina dock area can't be walked. Either widen the gap or accept it as scenery.
11. **Directory solid is 26×44 vs 26×40 visual**; cart solid (36×30 at y324) vs visual (36×24 at y330) — small deliberate-looking fudges; carry them over verbatim or normalize, but don't mix.
12. **Street path #5** (park spur) is missing its center-dash layer (all other roads have one).
13. **Courtyard planter trees have no collision** (not in `trees`) while the identical-looking world trees do.
14. **z-order note**: avatar z14 > roof z12, so the avatar would draw above a _closed_ roof if the player could ever be under it (they can't, but a React port with different clamps could expose it). Rail (z14) + train (z16) also draw above the roof.
15. **Format traps vs prod**: mockup pads are top-left rects (prod `Destination.pad` is center-based + `padRect()` converts); mockup trees are top-left+diameter (prod center+radius). Values match once converted — but a naive copy-paste double-converts.
16. **Permit units "SIGNAL"/"FIELDBOOK" are placeholder names** (README open item) — swap for real in-progress projects when the `status` schema lands.
17. Minor: `_teaserFor` defines an unused `A` helper; `sc-if` placeholder hints disagree with defaults (`roofSky` hinted true while billboard is default) — DC-editor cosmetics, ignore in port.

---

## G. Keyframe animations (12)

| name          | def                                  | purpose / used by                                                                                     |
| ------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `nc-blink`    | 0–49% op 1; 50–100% op 0 (step feel) | red warning lights: broadcast center, water tower, destination rooftop beacons (1.5s/2.2s `step-end`) |
| `nc-pulse`    | op .4 → 1 → .4                       | entry pads, status dots, crystal ball, crane load, buoy, footbridge lamps                             |
| `nc-flick`    | mostly 1, dips .35/.6 at 88–94%      | hanging label chips + park name + spot signage (durations 6.5–9.6s to desync)                         |
| `nc-mflick`   | dips at 3%, 38–41%, 73–75.5%         | neon/marquee signs, billboards, teaser corner brackets, rooftop signage                               |
| `nc-fan`      | rotate 360°                          | HVAC fans, washer drums, Pixel Pier ferris wheel, arcade fan                                          |
| `nc-ring`     | scale .9→1.6, op .7→0                | broadcast radar ring, fountain ripple, avatar ring, click-target ring                                 |
| `nc-steam`    | rise −16px, fade in/out              | ramen, café cup, taco truck steam wisps (staggered delays)                                            |
| `nc-pole`     | background-position → 0 22px         | barber-pole stripe scroll (1.6s linear)                                                               |
| `nc-curl`     | rotate 10° → −58° → 10°              | gym silhouette bicep curl (1.6s)                                                                      |
| `nc-pose`     | op 1 (0–26%) → 0 (33–93%) → 1        | yoga pose crossfade — 3 silhouettes, 9s, delays 0/−3/−6s                                              |
| `nc-dinerdie` | erratic .1↔.9 flicker                | diner `OPEN 24HRS` dying-neon at deep night (swapped in via `dinerAnim`)                              |
| `nc-attract`  | op .2→.75→.5→.85→.2                  | arcade attract-mode window glow                                                                       |

Global: `@media (prefers-reduced-motion: reduce)` kills ALL animations/transitions.
