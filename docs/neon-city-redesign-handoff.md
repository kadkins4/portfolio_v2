# Neon City World Redesign, Designer Handoff

## What exists today

The `/city` route is a walkable, top-down "Neon City." The world is a fixed 2400 x 1600 canvas, all coordinates are world-space. The player walks with WASD or by clicking the ground, collides with buildings, filler buildings, benches, and trees, and steps on a lit door pad to enter a destination. Roads are currently a rigid straight grid, and cars drive those straight lanes with node-based traffic lights.

Visual grammar is already established (see the "Building Studies" handoff, folder `design_handoff_building_studies`): dark shells (#110f1e / #131120) on a #0a0913 ground, one oklch accent hue per building (cyan 190 for engineering, amber 46 for residential, magenta 340 for atmosphere, purple 300 for postal), dashed detail lines, roof grids, spinning fan units, red blinking beacons, and a flickering JetBrains Mono sign plate. Keep all of it.

## The goal

Two problems to solve. First, on drop-in the four main destinations are scattered to the corners, so a visitor mostly sees the park and has to wander to find anything. Pull the mains in tight around the central park so they are visible on arrival. Second, the world feels boxy and grid-like. Make the streets organic and curved, and replace the current plain drop-in with a cinematic train arrival that sets the stage and hints there is more city out past the center.

Coordinates below are illustrative, meant to communicate placement and relationships, not final pixel values. A schematic of the target layout accompanies this doc.

## Building placement (Layout C)

Terminal Park stays the central anchor, roughly x900 y560, 660 x 450.

Projects is a park pavilion touching the west edge of the park, sitting right at the arrival landing. The player comes down the stairs on the LEFT side of the pavilion. The activation point (the lit entrance door pad) is on the RIGHT side, so the visitor steps off, walks down and around, and enters. Cyan (hue 190).

Resume sits in the northwest corner, visible from the landing as you look up and left. Cyan (hue 190). This is the "Adkins Line" transit theme.

About sits on the far (east) side of the park. From the landing it should be only just visible, so it reads as a reason to round the park rather than something handed to you. The road must curve around it. About must not sit on top of a road. Amber (hue 46).

Contact sits to the south, positioned so the arrival train passes it on the way in. It gets its moment during the ride and stays out of the crowded landing. Purple (hue 300).

The landing and platform are on the west side of the park, with a vertical final approach.

## Curved roads

Replace the straight grid with organic curved streets (SVG paths) that bend and route around the buildings. Streets should never clip through a building, and buildings should never stick out into a street. The curves are what kill the boxy feel. Keep exactly one straight arterial for now (see Traffic).

Roads are decorative for the player, movement is free across the whole ground and gated only by building and tree collision, so curving them has no effect on walking or click-to-walk. The only system tied to the grid is car traffic.

## Intro animation, the train arrival

The train enters from the south edge. The camera is on-rails, a set animation that follows the train.

The train swoops up in a curve, curls around the WEST side of the park, and pulls into a vertical platform beside the park, not on it.

The camera follows the whole ride. The avatar gets off at the top of the stairs and moves down to the landing (whether that walk-down is automatic or a short manual step is open, lean toward a smooth automatic walk-down that then hands over control).

At the moment control is handed to the player, the train departs and the rail continues off-screen.

After that, trains arrive at random intervals and stop at the station, as ambient life. This is the recurring, post-intro behavior.

The rail is the Adkins Line. It is currently a straight diagonal and needs to become a curve that matches the swoop described above.

## Flavor buildings

Not enterable. Two kinds, mixed together and scattered irregularly (varied sizes, slight rotations, off-grid) to fill the outer city:

1. Themed leisure and amusement pieces drawn from the Building Studies handoff, for example an arcade, and others in that library (ramen house, night market, and similar).
2. Plain gray shells, pure visual fill.

These carry the "there is more here" feeling until gamification and quests arrive.

## Traffic, phased

V1: one straight arterial where the existing car engine runs unchanged. Every other street is curved and decorative, with no cars.

V2: migrate cars to path-following. Each road becomes a path, each car is parameterized by distance traveled along that path, position comes from sampling the path (getPointAtLength) and heading from the tangent, and traffic lights and car-following become comparisons of distance along the same path instead of x/y math. Once that lands, the arterial can curve and more trafficked streets can be added freely.

## Reference assets

The Building Studies handoff (`design_handoff_building_studies`) contains the rooftop grammar, the amusement-park gate and fairgrounds pattern (study 3a, a landmark gate on the map that loads a separate fairgrounds location on enter), POI studies (3b: museum, arcade, broadcast tower, observatory, construction site, marina), stadium and venue studies, and the animation keyframes (nc-blink, nc-pulse, nc-flick, nc-mflick, nc-fan, plus water and drop-tower motions).

## Out of scope for this pass (future)

Gamification and small quests, and turning the amusement park into an enterable separate location. Design the outer flavor so it can later become interactive, but nothing here needs to be playable yet.
