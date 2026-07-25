# Neon City — New Buildings Design Brief

**Date:** 2026-07-22
**Status:** Approved direction, awaiting designer pass
**Audience:** Designer taking a visual pass; then engineering (Kenny + Claude) implements.

---

## 1. What the city is (context for the designer)

The city is a walkable 2D top-down neon world at `/city` — **pure DOM/CSS**, no canvas or WebGL. Buildings are absolutely-positioned styled divs inside a 2400×1600 world; the camera is a CSS transform. Everything is procedural (gradients, `oklch()` hues, border-radius) — there are no image/sprite assets, and new buildings should stay in that language.

**Existing systems to design within:**

- **Destinations** (enterable): building + glowing entry pad + accent "door" strip. Standing on the pad opens a teaser popover (kicker / title / blurb / CTA). Enter or clicking the CTA navigates. Current destinations: Projects pavilion, ADKINS LINE station (resume), UNIT 4B (about), POST OFFICE (contact).
- **POIs** (non-interactive props): museum, construction site, observatory, arcade, broadcast tower, ramen shop, night market.
- **Shells:** 13 gray filler buildings.
- **Day/night cycle:** 4-minute loop. Buildings can (and should) have night states — lit windows, neon signage.
- **Districts:** ambient labels on the map — NORTH GRID, DOCKSIDE, FAIRGROUNDS, THE LANDING, etc.
- **Copy voice** (match this): kickers like `✦ NEON CITY TRANSIT · CAREER SERVICE`, CTAs like `> ride the line`, `> knock on 4B`. Playful, in-world, lowercase commands.

All names below are **placeholders** — designer/Kenny free to rename.

---

## 2. The Galleria (project mall) — the centerpiece

The mall becomes **the** home for individual projects, replacing the Projects pavilion in that role. It's big and gets **its own district** of the map.

### The reveal mechanic (roof-lift)

- From outside, the mall reads as one large, handsome, **opaque-roofed** structure — you cannot see inside.
- The player walks through the main entrance → the **roof fades/slides away**, revealing an open-air courtyard of mini storefronts the player walks between. Still the same map — no scene change, existing collision and entry-pad systems reused inside.
- Walking back out the entrance restores the roof.
- Designer call: how the roof animates (fade, iris, slide, peel), and what the roof surface itself looks like (skylights? HVAC units? a big logo?).

### Inside the mall

Each **project is a mini storefront unit**. Walking up to a unit opens its teaser → CTA routes to that project's page.

- **Anchor units:** featured projects get larger corner/end-cap units with bigger signage.
- **Standard units:** the rest of the live projects.
- **Under-construction units:** projects with `status: in-progress` render boarded up — plywood, caution tape, scaffold/crane motif, and a **building-permit sign** carrying the project name. Teaser is a "coming soon" tease (no route, or routes to the page if one exists).
- **FOR LEASE units:** a handful of permanently empty units with `FOR LEASE — INQUIRE WITHIN` signage. Signals room to grow without feeling dead. Balance note from Kenny: _plenty of space for future projects, but the mall must not feel empty_ — designer should tune the ratio (suggest ~9 live + 2–3 construction + 3–4 for-lease to start).
- Courtyard dressing: benches, planters, a small fountain or kiosk cart, directory sign ("YOU ARE HERE" map — could be a cute miniature of the actual mall layout).

Current project inventory (Keystatic `.mdoc`, 9 projects): loresmith, saul, on-the-clock, diggs-johnson-museum, the-score-media, ricochet-rogue, the-score-bet, arbutus-recreation-center, vantage. Projects carry `district` (sports / games / tools / client-web) — unit accent hues could follow district colors.

### The kiosk (old pavilion)

The existing Projects pavilion is retired as a destination. Near the mall entrance, keep a small **kiosk/pavilion structure** — aesthetic for now, purpose TBD later (Kenny will find a use). Designer: treat it as a decorative info-kiosk companion to the mall.

### Data/schema note (engineering)

- Add `status: live | in-progress` select to the Keystatic project schema.
- `in-progress` projects are **hidden from the `/projects` page** — they exist only as construction units in the mall.

---

## 3. Commerce buildings (external links — not live yet)

Neither external destination exists yet. **Ship the buildings now with "opening soon" treatments**; real URLs get wired when platforms are chosen. Teaser CTAs will open in a new tab once live.

### 3a. Merch store — "ADKINS SUPPLY CO." (placeholder)

- **Role:** links to the shirt storefront (platform TBD).
- **Visual:** boutique storefront; big display window with 2–3 mannequin/tee silhouettes showing actual shirt designs (design as simple procedural tee shapes with printable graphic areas). Neon sign flickers on at night.
- **Pre-launch state:** papered windows with `OPENING SOON` posters.
- **Copy draft:** kicker `✦ NEON CITY RETAIL · SOFT OPENING`, title "Wear the city.", blurb "Shirts and other goods, made by the guy who made this place.", CTA `> browse the racks`.

### 3b. Coffee shop — "THE DAILY GRIND" (placeholder)

- **Role:** links to a Buy Me a Coffee / Ko-fi page (platform TBD).
- **Visual:** cozy corner café; steam curls rising from a rooftop cup sign (CSS particle wisps); warm window glow at night; a couple of outdoor tables with tiny chairs.
- **Pre-launch state:** `OPENING SOON` sandwich board out front.
- **Copy draft:** kicker `✦ NEON CITY CAFÉ · TIPS WELCOME`, title "Buy me a coffee.", blurb "Fuel for the next project. The espresso machine is rendered in pure CSS.", CTA `> leave a tip`.

---

## 4. Tie-in flavor buildings (small hooks into real content)

### 4a. Yoga studio — "STRETCH.CSS" (placeholder)

- Frosted glass front; a silhouette inside **cycles through yoga poses** (slow morphing between 3–5 pose silhouettes). Sidewalk sign: `POSE OF THE DAY: CROW`. Pose name could rotate daily. No link — pure flavor.

### 4b. Gym — "REPS & RENDERS" (placeholder)

- Yes, right near the yoga studio — the duplication is the joke. Window silhouette doing slow bicep curls or a bouncing jump-rope loop; neon `24HR` sign. No link.

### 4c. Library / bookstore → studio notes

- **Role:** front door for Kenny's published studio notes (the notes section of the site).
- **Visual:** stately small library — columns, warm interior glow, tiny book-spine rows in the windows. A `RETURN SLOT` in the wall.
- **Copy draft:** kicker `✦ NEON CITY ARCHIVE · STACKS OPEN LATE`, title "The stacks.", blurb "Field notes from the studio — what got built and what it taught me.", CTA `> browse the stacks`.

### 4d. Arcade upgrade → Ricochet Rogue

- The arcade POI **already exists** as a prop — promote it to a destination. Teaser links to Ricochet Rogue (an actual game). Cheapest "the city is connected" moment we have.
- **Visual additions:** attract-mode glow pulsing through the windows; one cabinet visible with a card motif on the marquee (Ricochet Rogue's motif is cards).
- **Copy draft:** kicker `✦ NEON CITY ARCADE · FREE PLAY`, title "One more run.", blurb "Ricochet Rogue — a card-slinging roguelike. The cabinet's warmed up.", CTA `> insert coin`.

### 4e. Observatory upgrade → currently learning

- Observatory POI already exists — promote to a light destination. The telescope is "pointed at what's next": the teaser shows Kenny's current learning focus (right now: AI agent workflows / loop engineering). One line of copy, updated occasionally; may or may not link anywhere.
- **Copy draft:** kicker `✦ NEON CITY OBSERVATORY · SKIES CLEAR`, title "Pointed at what's next.", blurb "Currently studying: building AI agent workflows. The lens gets refocused every few months.", CTA `> look through the lens` (optional).

### 4f. Movie theater — "THE MARQUEE" (placeholder)

- **Role:** doubles as a changelog. Marquee reads `NOW SHOWING:` + the most recently shipped project/feature; teaser links to it.
- **Visual:** classic theater front — bulb-lined marquee (twinkling CSS bulbs), poster cases flanking the doors (poster = project screenshot or procedural poster).
- Marquee text should be data-driven so it updates with releases.

### 4g. Billboards (2–3 around town)

- Rotating ads for the city's own businesses — shirt designs for ADKINS SUPPLY CO., "one more run" for the arcade, coffee steam for THE DAILY GRIND. Cross-promotion makes the city feel economically alive. Rooftop or freestanding; lit at night.

### 4h. Museum wink → Diggs Johnson Museum

- The existing museum POI gets a banner: current exhibition is **"THE DIGGS JOHNSON COLLECTION"** — a wink at the museum project Kenny actually built. Optionally promote to a destination linking to that project's page; at minimum it's a banner.

---

## 5. Pure ambiance (no links — the city just lives)

| Building                             | The bit                                                                                                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Laundromat — "SUDS CYCLE"**        | Row of washer portholes; drums spin with a soft glow, mesmerizing at night.                                                                                                                                              |
| **Diner — "GRIDLINE DINER"**         | Neon `OPEN 24HRS`; the sign **flickers/half-dies at deep night** in the day/night cycle, then buzzes back.                                                                                                               |
| **Water tower**                      | On stilts above a rooftop or hill: `ADKINS` painted on the tank, aircraft-warning light blinking at night.                                                                                                               |
| **Food truck — "TACO PROCESS"**      | Parked near Terminal Park; service window glow, steam wisps, small queue of… nobody, or one bench-sitter. Could relocate to different parking spots between visits someday.                                              |
| **Barbershop — "FADE FUNCTION"**     | Classic spinning barber pole (CSS animation). Tiny `WALK-INS WELCOME` sign.                                                                                                                                              |
| **Fortune teller — "MADAME ORACLE"** | Purple tent or narrow storefront, glowing crystal-ball window. Walking up shows a random line: dev proverbs ("It works on my machine — and my machine is the cloud") or fun facts about Kenny. Small rotating copy pool. |

---

## 6. Suggested phasing (engineering, post-designer)

1. **Phase 1 — The Galleria:** mall structure + roof-lift + storefront units from project data + `status` schema + kiosk. (Biggest lift, biggest payoff.)
2. **Phase 2 — Commerce:** merch store + coffee shop with opening-soon states; wire URLs when platforms chosen.
3. **Phase 3 — Tie-ins:** arcade + observatory promotions (cheap), library, theater, museum banner, billboards.
4. **Phase 4 — Ambiance:** yoga, gym, laundromat, diner, water tower, food truck, barbershop, fortune teller — can trickle in one at a time; each is a small self-contained PR.

---

## 7. Open questions for the designer

1. **Mall footprint & placement:** which part of the map becomes the mall district? (World is 2400×1600; current open-ish areas exist — engineering can supply a coordinate map of free space.) Does the world need to grow?
2. **Roof-lift animation:** fade, slide, iris, peel? What lives on the roof surface?
3. **Storefront differentiation:** how much visual variety between mall units — per-district hues, per-project signage motifs, or uniform units with signage only?
4. **Billboard placement** and whether they're rooftop, freestanding, or both.
5. **Density check:** ~14 new structures + 2 upgrades on top of the existing 4 destinations + 7 POIs + 13 shells — does the map need rebalancing (retire some gray shells in favor of the new flavor buildings?). Recommendation: yes, convert shells where possible instead of pure adds.
6. Naming — all names above are placeholders.
