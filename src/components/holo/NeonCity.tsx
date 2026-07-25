"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  WORLD,
  CHAR_R,
  MARGIN,
  SPAWN,
  ROAD_W,
  NODES,
  RAIL_PATH,
  TERMINAL,
  PARK,
  DESTINATIONS,
  padRect,
  centerRect,
  SHELLS,
  BLOBS,
  TREES,
  BENCHES,
  LAMPS,
  DISTRICT_LABELS,
  HUES,
  hueColor,
  GALLERIA,
  APARTMENT,
  STATION,
  type Destination,
  type Car,
} from "@/lib/cityData";
import {
  buildGalleriaUnits,
  type CityProject,
  type GalleriaUnit,
} from "@/lib/galleriaUnits";
import { hitsSolid } from "@/lib/cityCollision";
import { pathTo } from "@/lib/nav/cityNav";
import { FAST_TRAVEL_ITEMS } from "@/lib/cityFastTravel";
import { useIsTouch } from "@/hooks/useIsTouch";
import TouchJoystick from "./TouchJoystick";
import FastTravelDrawer from "./FastTravelDrawer";
import GalleriaLayer from "./GalleriaLayer";
import ApartmentLayer from "./ApartmentLayer";
import StationLayer from "./StationLayer";
import CityDevPanel from "./CityDevPanel";
import CollisionDebugLayer from "./CollisionDebugLayer";
import HueDot from "./HueDot";
import styles from "./neonCity.module.css";

const BONK_WORDS = ["BONK!", "OOF!", "HEY!", "WATCH IT!", "*SPLAT*"];

const KEYMAP: Record<string, string> = {
  w: "up",
  arrowup: "up",
  s: "down",
  arrowdown: "down",
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
};

// V1 traffic: ambient cars on the single straight arterial (y=320), two lanes
// (301 eastbound, 339 westbound). No lights/nodes/car-following needed since the
// arterial has no intersections; the richer engine stays dormant for V2.
function seedCars(): Car[] {
  return [
    { x: 120, y: 301, dx: 2.3, dy: 0, hue: 190 },
    { x: 760, y: 301, dx: 2.05, dy: 0, hue: 46 },
    { x: 1600, y: 301, dx: 2.5, dy: 0, hue: 340 },
    { x: 2100, y: 339, dx: -2.2, dy: 0, hue: 300 },
    { x: 1240, y: 339, dx: -2.45, dy: 0, hue: 190 },
    { x: 420, y: 339, dx: -2.0, dy: 0, hue: 46 },
  ];
}

// easing for the train ride (in) and departure (out)
const easeIO = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeIn = (t: number) => t * t * t;

// Scripted avatar walk-down: 800ms pause at the carriage door, then a
// smoothstep glide off the west platform, down the stairs, to SPAWN. Derived
// from TERMINAL so moving the station moves the arrival with it.
const WALK_PTS: [number, number][] = [
  // stepping off the carriage onto the deck
  [TERMINAL.platform.x + TERMINAL.platform.w / 2, TERMINAL.gap.top - 40],
  // along the deck to the ramp mouth
  [
    TERMINAL.platform.x + TERMINAL.platform.w / 2,
    (TERMINAL.gap.top + TERMINAL.gap.bot) / 2,
  ],
  // through the turnstiles and down the ramp
  [TERMINAL.ramp.x + TERMINAL.ramp.w / 2, SPAWN.y],
  [SPAWN.x, SPAWN.y],
];
function avatarWalk(wt: number): [number, number] {
  const pause = 800;
  const dur = 2400;
  if (wt <= pause) return WALK_PTS[0];
  let t = Math.min(1, (wt - pause) / dur);
  t = t * t * (3 - 2 * t);
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < WALK_PTS.length - 1; i++) {
    const d = Math.hypot(
      WALK_PTS[i + 1][0] - WALK_PTS[i][0],
      WALK_PTS[i + 1][1] - WALK_PTS[i][1]
    );
    lens.push(d);
    total += d;
  }
  let dist = t * total;
  for (let i = 0; i < lens.length; i++) {
    if (dist <= lens[i]) {
      const f = lens[i] ? dist / lens[i] : 0;
      return [
        WALK_PTS[i][0] + (WALK_PTS[i + 1][0] - WALK_PTS[i][0]) * f,
        WALK_PTS[i][1] + (WALK_PTS[i + 1][1] - WALK_PTS[i][1]) * f,
      ];
    }
    dist -= lens[i];
  }
  return WALK_PTS[WALK_PTS.length - 1];
}

export default function NeonCity({
  name = "Kendall Adkins",
  projects = [],
}: {
  name?: string;
  projects?: CityProject[];
}) {
  const router = useRouter();
  const isTouch = useIsTouch();
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");

  // --- refs (per-frame, non-reactive) ---
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const daytintRef = useRef<HTMLDivElement>(null);
  const lampWrapRef = useRef<HTMLDivElement>(null);
  const carEls = useRef<(HTMLDivElement | null)[]>([]);
  const trainEls = useRef<(HTMLDivElement | null)[]>([]);

  const pos = useRef({ x: SPAWN.x, y: SPAWN.y, ang: 0, moving: false });
  const keys = useRef<Set<string>>(new Set());
  const joy = useRef<{ x: number; y: number; mag: number }>({
    x: 0,
    y: 0,
    mag: 0,
  });
  const target = useRef<{ x: number; y: number } | null>(null);
  const path = useRef<{ x: number; y: number }[]>([]);
  const bonkIdx = useRef(0);
  const everMovedRef = useRef(false);
  const ftGlide = useRef<{
    key: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    t0: number | null;
  } | null>(null);
  // One array, two handles: render maps `carList` (so we never read a ref
  // during render), while the rAF loop keeps mutating `cars.current` in place.
  // They are the same object — the car <div>s are laid out once and animated
  // imperatively via `carEls`, so render never needs to see position changes.
  const carList = useMemo(() => seedCars(), []);
  const cars = useRef<Car[]>(carList);
  const train = useRef<{
    mode: "in" | "dwell" | "out" | "away";
    t: number;
    until: number;
    sFront: number;
  }>({ mode: "in", t: 0, until: 0, sFront: 0 });
  const invuln = useRef(0);
  const cam = useRef({ tx: 0, ty: 0, s: 1 });
  const panelRef = useRef<string | null>(null);
  const dismissed = useRef<Set<string>>(new Set());
  const onPadRef = useRef<string | null>(null);
  const roofRef = useRef<HTMLDivElement>(null);
  const aptRoofRef = useRef<HTMLDivElement>(null);
  const stnRoofRef = useRef<HTMLDivElement>(null);
  const start = useRef(0);
  // cinematic arrival intro
  const intro = useRef<{ phase: "ride" | "walk" | "done"; walkT: number }>({
    phase: "ride",
    walkT: 0,
  });
  const camDone = useRef<{
    t0: number | null;
    fromTx: number;
    fromTy: number;
    fromS: number;
  }>({ t0: null, fromTx: 0, fromTy: 0, fromS: 1 });
  const captionRef = useRef("");

  // --- reactive state (HUD only) ---
  const [panel, setPanel] = useState<string | null>(null);
  const [onPad, setOnPad] = useState<string | null>(null);
  const [hits, setHits] = useState(0);
  const [introPhase, setIntroPhase] = useState<"ride" | "walk" | "done">(
    "ride"
  );
  const [caption, setCaption] = useState("THE ADKINS LINE · INBOUND");
  const [everMoved, setEverMoved] = useState(false);
  const [arrived, setArrived] = useState(true);
  const [clock, setClock] = useState({
    label: "00:00 · NIGHT",
    dot: "#aab4e8",
  });
  // ?dev=1 unlocks the collider overlay. The roof lift is no longer a choice —
  // "split" shipped, and the iris and fade branches are gone.
  const [dev, setDev] = useState(false);
  const [colliders, setColliders] = useState(false);
  useEffect(() => {
    const isDev =
      new URLSearchParams(window.location.search).get("dev") === "1";
    setDev(isDev);
    if (isDev) {
      setColliders(localStorage.getItem("neoncity.colliders") === "1");
    }
  }, []);
  function pickColliders(on: boolean) {
    setColliders(on);
    localStorage.setItem("neoncity.colliders", on ? "1" : "0");
  }

  const dest = useMemo(
    () => Object.fromEntries(DESTINATIONS.map((d) => [d.key, d])),
    []
  );

  // Galleria storefronts, derived from the project list. Occupied units carry a
  // pad + teaser and route to /projects/[slug]; vacant ones render FOR LEASE.
  const units = useMemo(() => buildGalleriaUnits(projects), [projects]);
  const unitTargets = useMemo(
    () =>
      Object.fromEntries(
        units.filter((u) => u.pad).map((u) => [u.id, u])
      ) as Record<string, GalleriaUnit>,
    [units]
  );
  // the RAF loop + key handlers close over initial values, so reach the current
  // targets through a ref
  const unitTargetsRef = useRef(unitTargets);
  useEffect(() => {
    unitTargetsRef.current = unitTargets;
  }, [unitTargets]);

  // arrival beat fades after ~4.6s
  useEffect(() => {
    const t = window.setTimeout(() => setArrived(false), 4600);
    return () => window.clearTimeout(t);
  }, []);

  // lock page scroll while the city is mounted (desktop + mobile). The stage is
  // a fixed full-viewport surface; any document scroll or iOS rubber-band would
  // steal touch drags from the joystick and shift the world under the camera.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevOverscroll = body.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      body.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    function markMoved() {
      if (!everMovedRef.current) {
        everMovedRef.current = true;
        setEverMoved(true);
      }
    }

    function openPanel(key: string | null) {
      if (panelRef.current === key) return;
      panelRef.current = key;
      setPanel(key);
    }

    function enterDest(key: string) {
      const d = dest[key] ?? unitTargetsRef.current[key];
      if (!d?.href) return;
      router.push(d.href);
    }

    // ---- input ----
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k))
        e.preventDefault();
      if (k === "escape") {
        if (panelRef.current) {
          if (onPadRef.current) dismissed.current.add(onPadRef.current);
          openPanel(null);
        }
        return;
      }
      if (k === "enter") {
        if (panelRef.current) enterDest(panelRef.current);
        return;
      }
      if (KEYMAP[k]) {
        keys.current.add(KEYMAP[k]);
        target.current = null;
        path.current = [];
        ftGlide.current = null;
        markMoved();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (KEYMAP[k]) keys.current.delete(KEYMAP[k]);
    };
    const onClick = (e: MouseEvent) => {
      // no walking during the cinematic intro
      if (intro.current.phase !== "done") return;
      // ignore clicks that land on HUD chrome (buttons/teaser handle themselves)
      if ((e.target as HTMLElement).closest("[data-hud]")) return;
      const wx = (e.clientX - cam.current.tx) / cam.current.s;
      const wy = (e.clientY - cam.current.ty) / cam.current.s;
      const wps = pathTo(
        { x: pos.current.x, y: pos.current.y },
        { x: wx, y: wy }
      );
      if (wps.length) {
        path.current = wps.slice(1);
        target.current = wps[0];
      } else {
        path.current = [];
        target.current = { x: wx, y: wy };
      }
      ftGlide.current = null;
      markMoved();
    };

    // Captured once so cleanup detaches from the same node it attached to,
    // even if the ref has moved on by teardown.
    const stage = stageRef.current;
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    stage?.addEventListener("click", onClick);

    start.current = performance.now();
    let lastNow = performance.now();
    let stuck = 0;
    let raf = 0;

    // rail geometry: an off-screen path for getPointAtLength sampling
    const svgNS = "http://www.w3.org/2000/svg";
    const measSvg = document.createElementNS(svgNS, "svg");
    measSvg.setAttribute("width", "0");
    measSvg.setAttribute("height", "0");
    measSvg.style.position = "absolute";
    measSvg.style.left = "-9999px";
    const railPath = document.createElementNS(svgNS, "path");
    railPath.setAttribute("d", RAIL_PATH);
    measSvg.appendChild(railPath);
    document.body.appendChild(measSvg);
    const railLen = railPath.getTotalLength();
    // stop point: first sample on the vertical approach (x≈680) at the platform
    let railStop = railLen;
    for (let s = 0; s < railLen; s += 4) {
      const pt = railPath.getPointAtLength(s);
      if (Math.abs(pt.x - 680) < 3 && pt.y <= 602) {
        railStop = s;
        break;
      }
    }
    const railPtAt = (s: number): { x: number; y: number; a: number } => {
      const L = railLen;
      if (s < 0) {
        const p1 = railPath.getPointAtLength(0);
        const p2 = railPath.getPointAtLength(3);
        const dx = p2.x - p1.x,
          dy = p2.y - p1.y,
          d = Math.hypot(dx, dy) || 1;
        return {
          x: p1.x + (dx / d) * s,
          y: p1.y + (dy / d) * s,
          a: (Math.atan2(dy, dx) * 180) / Math.PI,
        };
      }
      if (s > L) {
        const p1 = railPath.getPointAtLength(L - 3);
        const p2 = railPath.getPointAtLength(L);
        const dx = p2.x - p1.x,
          dy = p2.y - p1.y,
          d = Math.hypot(dx, dy) || 1;
        return {
          x: p2.x + (dx / d) * (s - L),
          y: p2.y + (dy / d) * (s - L),
          a: (Math.atan2(dy, dx) * 180) / Math.PI,
        };
      }
      const pt = railPath.getPointAtLength(s);
      const p1 = railPath.getPointAtLength(Math.max(0, s - 3));
      const p2 = railPath.getPointAtLength(Math.min(L, s + 3));
      return {
        x: pt.x,
        y: pt.y,
        a: (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI,
      };
    };

    // touch/coarse-pointer devices get a tighter cinematic framing (the
    // desktop width-fit scale collapses to ~0.28 on a phone). Captured once at
    // mount; touch-ness does not change within a session.
    const coarse =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;

    // reduced motion: skip the cinematic, drop straight to the landing
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      intro.current = { phase: "done", walkT: 9999 };
      setIntroPhase("done");
      pos.current.x = SPAWN.x;
      pos.current.y = SPAWN.y;
      train.current.mode = "dwell";
      train.current.until = Number.POSITIVE_INFINITY;
      camDone.current = { t0: -1e9, fromTx: 0, fromTy: 0, fromS: 1 };
    }

    const loop = (now: number) => {
      const p = pos.current;
      const speed = 4;
      // delta-time factor, normalized to a 60fps baseline so movement, traffic,
      // the train, and i-frames run at the same real speed on 120/144Hz displays.
      const dt = Math.min(50, now - lastNow);
      lastNow = now;
      const f = dt / 16.6667;
      const px0 = p.x;
      const py0 = p.y;

      // ---- movement ----
      let vx = 0;
      let vy = 0;
      let moving = false;
      const IN = intro.current;
      if (IN.phase === "ride") {
        // cinematic: camera follows the train; the avatar is hidden here
      } else if (IN.phase === "walk") {
        // scripted walk-down from the train to the landing
        IN.walkT += dt;
        const [ax, ay] = avatarWalk(IN.walkT);
        if (ax !== p.x || ay !== p.y)
          p.ang = (Math.atan2(ay - p.y, ax - p.x) * 180) / Math.PI;
        p.x = ax;
        p.y = ay;
        moving = IN.walkT > 800 && IN.walkT < 3200;
        if (IN.walkT >= 3400) {
          p.x = SPAWN.x;
          p.y = SPAWN.y;
          IN.phase = "done";
          setIntroPhase("done");
          camDone.current = {
            t0: null,
            fromTx: cam.current.tx,
            fromTy: cam.current.ty,
            fromS: cam.current.s,
          };
        }
      } else {
        const g = ftGlide.current;
        if (g) {
          // fast-travel: eased position glide over ~0.95s, ignores collision
          if (g.t0 === null) g.t0 = now;
          const prog = Math.min(1, (now - g.t0) / 950);
          const e =
            prog < 0.5 ? 2 * prog * prog : 1 - Math.pow(-2 * prog + 2, 2) / 2;
          p.x = g.fromX + (g.toX - g.fromX) * e;
          p.y = g.fromY + (g.toY - g.fromY) * e;
          p.ang =
            (Math.atan2(g.toY - g.fromY, g.toX - g.fromX) * 180) / Math.PI;
          moving = true;
          if (prog >= 1) {
            const key = g.key;
            ftGlide.current = null;
            dismissed.current.delete(key);
            openPanel(key);
          }
        } else {
          const step = speed * f;
          if (target.current) {
            const tg = target.current;
            const dx = tg.x - p.x;
            const dy = tg.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < step + 1) {
              p.x = tg.x;
              p.y = tg.y;
              if (path.current.length) {
                target.current = path.current.shift()!;
              } else {
                target.current = null;
              }
            } else {
              vx = (dx / dist) * step;
              vy = (dy / dist) * step;
            }
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
          moving = vx !== 0 || vy !== 0;
          if (moving) {
            p.ang = (Math.atan2(vy, vx) * 180) / Math.PI;
            // axis-separated collision
            const nx = Math.max(MARGIN, Math.min(WORLD.w - MARGIN, p.x + vx));
            if (!hitsSolid(nx, p.y)) p.x = nx;
            const ny = Math.max(MARGIN, Math.min(WORLD.h - MARGIN, p.y + vy));
            if (!hitsSolid(p.x, ny)) p.y = ny;
          }
          // abandon an unreachable click-target: if walking to a target but fully
          // blocked (position didn't change) for several frames, give up so the
          // avatar doesn't march in place with the camera frozen.
          if (target.current) {
            if (Math.abs(p.x - px0) < 0.01 && Math.abs(p.y - py0) < 0.01) {
              stuck += 1;
              if (stuck > 12) {
                target.current = null;
                path.current = [];
                stuck = 0;
              }
            } else {
              stuck = 0;
            }
          } else {
            stuck = 0;
          }
        }
      }
      p.moving = moving;

      // ---- camera ----
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let s: number;
      let cx: number;
      let cy: number;
      if (IN.phase === "ride") {
        // follow the train, zoomed to a cinematic frame. Mobile frames tighter
        // (~560px of world) so you ride on top of the train, seeing around it,
        // instead of the desktop width-fit that shrinks it to a speck.
        s = coarse
          ? Math.min(vw / 560, vh / 760)
          : Math.min(vw / 1400, vh / 800);
        if (s > 1.05) s = 1.05;
        const pt = railPtAt(train.current.sFront);
        const hw = vw / (2 * s);
        const hh = vh / (2 * s);
        cx = Math.max(hw, Math.min(WORLD.w - hw, pt.x));
        cy = Math.max(Math.min(hh, 800), Math.min(WORLD.h - hh + 90, pt.y));
      } else if (IN.phase === "walk") {
        // hold a framed shot of the landing while the avatar steps down.
        // Mobile keeps the tighter framing so the avatar stays large on a phone.
        s = coarse
          ? Math.min(vw / 560, vh / 820)
          : Math.min(vw / 1600, vh / 900);
        if (s > 1.1) s = 1.1;
        const hw = vw / (2 * s);
        const hh = vh / (2 * s);
        cx = Math.max(hw, Math.min(WORLD.w - hw, 890));
        cy = Math.max(hh, Math.min(WORLD.h - hh, 770));
      } else {
        // gameplay: 1:1 follow-cam
        s = 1;
        cx = Math.max(vw / 2, Math.min(WORLD.w - vw / 2, p.x));
        cy = Math.max(vh / 2, Math.min(WORLD.h - vh / 2, p.y));
      }
      let tx = vw / 2 - cx * s;
      let ty = vh / 2 - cy * s;
      // ease the handoff (walk framing → 1:1 follow) over ~1s
      if (IN.phase === "done") {
        if (camDone.current.t0 === null) camDone.current.t0 = now;
        const k = Math.min(1, (now - camDone.current.t0) / 1000);
        if (k < 1) {
          const e = easeIO(k);
          const cd = camDone.current;
          tx = cd.fromTx + (tx - cd.fromTx) * e;
          ty = cd.fromTy + (ty - cd.fromTy) * e;
          s = cd.fromS + (s - cd.fromS) * e;
        }
      }
      cam.current.tx = tx;
      cam.current.ty = ty;
      cam.current.s = s;
      if (worldRef.current)
        worldRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;

      // ---- avatar ----
      if (charRef.current) {
        charRef.current.style.opacity = IN.phase === "ride" ? "0" : "1";
        charRef.current.style.transform = `translate(${p.x - 14}px, ${
          p.y - 14
        }px)`;
        const cls = charRef.current.classList;
        if (moving) cls.add(styles.walking);
        else cls.remove(styles.walking);
      }
      if (avatarRef.current)
        avatarRef.current.style.transform = `rotate(${p.ang}deg)`;

      // ---- traffic ----
      if (invuln.current > 0) invuln.current -= dt;
      const ewGreen = Math.floor(now / 5000) % 2 === 0;
      const arr = cars.current;
      for (let i = 0; i < arr.length; i++) {
        const c = arr[i];
        const horiz = c.dx !== 0;
        // traffic light: stop if this axis is red and approaching a node
        let hold = false;
        const redForMe = horiz ? !ewGreen : ewGreen;
        if (redForMe) {
          for (const nd of NODES) {
            if (horiz && Math.abs(c.y - nd.y) < ROAD_W / 2) {
              const approach = c.dx > 0 ? nd.x - ROAD_W / 2 : nd.x + ROAD_W / 2;
              const gap = (approach - c.x) * Math.sign(c.dx);
              if (gap > 0 && gap < 40) hold = true;
            }
            if (!horiz && Math.abs(c.x - nd.x) < ROAD_W / 2) {
              const approach = c.dy > 0 ? nd.y - ROAD_W / 2 : nd.y + ROAD_W / 2;
              const gap = (approach - c.y) * Math.sign(c.dy);
              if (gap > 0 && gap < 40) hold = true;
            }
          }
        }
        // car-following: hold if a same-lane car is within 46px ahead
        if (!hold) {
          for (let j = 0; j < arr.length; j++) {
            if (j === i) continue;
            const o = arr[j];
            if (horiz && o.dx === c.dx && Math.abs(o.y - c.y) < 8) {
              const ahead = (o.x - c.x) * Math.sign(c.dx);
              if (ahead > 0 && ahead < 46) hold = true;
            }
            if (!horiz && o.dy === c.dy && Math.abs(o.x - c.x) < 8) {
              const ahead = (o.y - c.y) * Math.sign(c.dy);
              if (ahead > 0 && ahead < 46) hold = true;
            }
          }
        }
        if (!hold) {
          c.x += c.dx * f;
          c.y += c.dy * f;
          // wrap one car-length past each wall so cars re-enter off-screen
          if (c.x > WORLD.w + 60) c.x = -60;
          if (c.x < -60) c.x = WORLD.w + 60;
          if (c.y > WORLD.h + 60) c.y = -60;
          if (c.y < -60) c.y = WORLD.h + 60;
        }
        // player collision
        if (invuln.current <= 0) {
          const cw = horiz ? 34 : 15;
          const ch = horiz ? 15 : 34;
          if (
            p.x + CHAR_R > c.x - cw / 2 &&
            p.x - CHAR_R < c.x + cw / 2 &&
            p.y + CHAR_R > c.y - ch / 2 &&
            p.y - CHAR_R < c.y + ch / 2
          ) {
            // bonk
            invuln.current = 900;
            const kdir = horiz ? Math.sign(c.dx) : 0;
            const kdirY = horiz ? 0 : Math.sign(c.dy);
            const kx = Math.max(
              MARGIN,
              Math.min(WORLD.w - MARGIN, p.x + kdir * 74)
            );
            const ky = Math.max(
              MARGIN,
              Math.min(WORLD.h - MARGIN, p.y + kdirY * 74)
            );
            if (!hitsSolid(kx, p.y)) p.x = kx;
            if (!hitsSolid(p.x, ky)) p.y = ky;
            target.current = null;
            path.current = [];
            setHits((h) => h + 1);
            // screen shake
            const st = stageRef.current;
            if (st && !reduce) {
              st.classList.remove(styles.shake);
              void st.offsetWidth;
              st.classList.add(styles.shake);
            }
            // floating word
            spawnBonk();
          }
        }
        const el = carEls.current[i];
        if (el)
          el.style.transform = `translate(${c.x - (horiz ? 17 : 7.5)}px, ${
            c.y - (horiz ? 7.5 : 17)
          }px)`;
      }

      // ---- train: path-follows the curved Adkins Line (in → dwell → out → away) ----
      const tr = train.current;
      if (tr.mode === "in") {
        tr.t += dt;
        const pr = Math.min(1, tr.t / 8000);
        tr.sFront = easeIO(pr) * railStop;
        if (intro.current.phase === "ride") {
          const cap =
            pr > 0.75
              ? "NOW ARRIVING · TERMINAL, WEST PLATFORM"
              : pr > 0.42
                ? "CURLING WEST OF THE PARK"
                : pr > 0.2
                  ? "PASSING · POST OFFICE ( CONTACT )"
                  : "THE ADKINS LINE · INBOUND";
          if (cap !== captionRef.current) {
            captionRef.current = cap;
            setCaption(cap);
          }
        }
        if (pr >= 1) {
          if (intro.current.phase === "ride") {
            // hand the ride to the walk-down; hold the train at the platform
            intro.current.phase = "walk";
            intro.current.walkT = 0;
            setIntroPhase("walk");
            tr.mode = "dwell";
            tr.until = now + 5200;
          } else {
            tr.mode = "dwell";
            tr.until = now + 3500 + Math.random() * 2500;
          }
        }
      } else if (tr.mode === "dwell") {
        tr.sFront = railStop;
        // don't depart mid-intro; wait until the player has control
        if (now >= tr.until && intro.current.phase === "done") {
          tr.mode = "out";
          tr.t = 0;
        }
      } else if (tr.mode === "out") {
        tr.t += dt;
        const q = Math.min(1, tr.t / 3800);
        tr.sFront = railStop + easeIn(q) * (railLen + 280 - railStop);
        if (q >= 1) {
          tr.mode = "away";
          tr.until = now + 9000 + Math.random() * 14000;
        }
      } else if (tr.mode === "away") {
        if (now >= tr.until) {
          tr.mode = "in";
          tr.t = 0;
          tr.sFront = 0;
        }
      }
      for (let i = 0; i < 3; i++) {
        const el = trainEls.current[i];
        if (!el) continue;
        if (tr.mode === "away") {
          el.style.opacity = "0";
          continue;
        }
        el.style.opacity = "1";
        const pt = railPtAt(tr.sFront - 27 - i * 62);
        el.style.transform = `translate(${pt.x - 13}px, ${pt.y - 27}px) rotate(${
          pt.a + 90
        }deg)`;
      }

      // ---- pad detection ----
      let padKey: string | null = null;
      for (const d of DESTINATIONS) {
        const r = padRect(d);
        if (p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h) {
          padKey = d.key;
          break;
        }
      }
      if (!padKey) {
        for (const u of Object.values(unitTargetsRef.current)) {
          const r = centerRect(u.pad!);
          if (p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h) {
            padKey = u.id;
            break;
          }
        }
      }
      if (padKey !== onPadRef.current) {
        onPadRef.current = padKey;
        setOnPad(padKey);
        if (padKey === null) {
          // walked off — close any teaser + clear dismissal
          if (panelRef.current) openPanel(null);
          dismissed.current.clear();
        } else if (!dismissed.current.has(padKey) && !ftGlide.current) {
          openPanel(padKey);
        }
      }

      // ---- roofs (open when inside or approaching the doorway) ----
      // derived from position every frame, so leaving closes them for free
      const inZone = (z: { x0: number; x1: number; y0: number; y1: number }) =>
        p.x > z.x0 && p.x < z.x1 && p.y > z.y0 && p.y < z.y1;
      if (roofRef.current) {
        const g = GALLERIA.open;
        roofRef.current.dataset.open =
          inZone(g.inside) || inZone(g.nearGap) ? "1" : "0";
      }
      if (aptRoofRef.current) {
        const a = APARTMENT.open;
        aptRoofRef.current.dataset.open =
          inZone(a.inside) || inZone(a.nearGap) ? "1" : "0";
      }
      if (stnRoofRef.current) {
        const s = STATION.open;
        stnRoofRef.current.dataset.open =
          inZone(s.inside) || inZone(s.nearDoor) ? "1" : "0";
      }

      // ---- day/night ----
      const cycleMs = 4 * 60000;
      const t = ((now - start.current) % cycleMs) / cycleMs;
      const dayness = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
      if (daytintRef.current)
        daytintRef.current.style.opacity = String(dayness * 0.34);
      if (lampWrapRef.current)
        lampWrapRef.current.style.opacity = String(0.35 + 0.65 * (1 - dayness));

      // clock (throttled ~1/s)
      if (Math.floor(now / 1000) !== Math.floor((now - 16) / 1000)) {
        const mins = Math.floor(t * 1440);
        const hh = String(Math.floor(mins / 60)).padStart(2, "0");
        const mm = String(mins % 60).padStart(2, "0");
        const rising = Math.sin(t * Math.PI * 2) > 0;
        let phase: string;
        let dot: string;
        if (dayness > 0.7) {
          phase = "DAY";
          dot = "#f2d98c";
        } else if (dayness < 0.3) {
          phase = "NIGHT";
          dot = "#aab4e8";
        } else {
          phase = rising ? "DAWN" : "DUSK";
          dot = "#e8a97c";
        }
        setClock({ label: `${hh}:${mm} · ${phase}`, dot });
      }

      raf = requestAnimationFrame(loop);
    };

    function spawnBonk() {
      const host = charRef.current;
      if (!host) return;
      const w = document.createElement("div");
      w.className = styles.bonkWord;
      w.textContent = BONK_WORDS[bonkIdx.current % BONK_WORDS.length];
      bonkIdx.current += 1;
      host.appendChild(w);
      window.setTimeout(() => w.remove(), 900);
    }

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      stage?.removeEventListener("click", onClick);
      measSvg.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fast-travel: glide to a pad then open its teaser (Home leaves the city)
  function skipIntro() {
    if (intro.current.phase === "done") return;
    intro.current.phase = "done";
    intro.current.walkT = 9999;
    setIntroPhase("done");
    pos.current.x = SPAWN.x;
    pos.current.y = SPAWN.y;
    pos.current.ang = 0;
    // snap the camera straight to 1:1 (no ease from the cinematic frame)
    camDone.current = { t0: -1e9, fromTx: 0, fromTy: 0, fromS: 1 };
    // let the held train dwell a beat, then resume ambient service
    train.current.mode = "dwell";
    train.current.until = performance.now() + 1500;
  }

  function fastTravel(key: string) {
    if (key === "home") {
      router.push("/");
      return;
    }
    const d = dest[key];
    if (!d) return;
    // eased camera+character glide straight to the pad, then auto-open teaser
    target.current = null;
    path.current = [];
    ftGlide.current = {
      key,
      fromX: pos.current.x,
      fromY: pos.current.y,
      toX: d.pad.x,
      toY: d.pad.y,
      t0: null,
    };
    if (!everMoved) setEverMoved(true);
  }

  const activePanel = panel ? (dest[panel] ?? unitTargets[panel]) : null;

  // The static world (~300 nodes) only depends on `onPad` for the pad glow;
  // memoizing it keeps the 1Hz clock tick and teaser state from reconciling
  // the whole city every render. Per-frame motion is imperative via refs.
  const world = useMemo(
    () => (
      <div ref={worldRef} className={styles.world}>
        {/* district ground blobs */}
        {BLOBS.map((bl, i) => (
          <div
            key={`blob${i}`}
            id={`nc-blob-${i}`}
            className={styles.blob}
            style={{
              left: bl.x,
              top: bl.y,
              width: bl.w,
              height: bl.h,
              background: bl.bg,
              borderRadius: bl.br,
              transform: `rotate(${bl.rot}deg)`,
            }}
          />
        ))}

        {/* district ground labels */}
        {DISTRICT_LABELS.map((l) => (
          <div
            key={l.text}
            id={`nc-district-label-${l.text.toLowerCase().replace(/\s+/g, "-")}`}
            className={styles.districtLabel}
            style={{
              left: l.x,
              top: l.y,
              color: l.col,
              fontSize: l.size,
            }}
          >
            {l.text}
          </div>
        ))}

        {/* rail: shadow, promenade, track, pillars */}
        <RailLayer />

        {/* streets: curved decorative net + one straight arterial (V1 traffic) */}
        <StreetLayer />

        {/* lamps (brighten at night) */}
        <div ref={lampWrapRef}>
          {LAMPS.map((l, i) => (
            <div key={`lp${i}`} id={`nc-lamp-${i}`}>
              <div
                className={styles.lampPool}
                style={{ left: l.x, top: l.y }}
              />
              {/* the core is centred by its own transform, so it takes the
                  pool's exact position — no half-size offset */}
              <div
                className={styles.lampCore}
                style={{ left: l.x, top: l.y }}
              />
            </div>
          ))}
        </div>

        {/* Terminal Park */}
        <ParkLayer name={name} first={first} last={last} />

        {/* plain gray shells (visual fill, not enterable) */}
        {SHELLS.map((s, i) => (
          <div
            key={`shell${i}`}
            id={`nc-shell-${i}`}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y,
              width: s.w,
              height: s.h,
              transform: `rotate(${s.rot}deg)`,
              borderRadius: s.br,
              background: "#100e1c",
              border: "1px solid rgba(150,140,220,.11)",
              boxShadow: "0 0 16px rgba(0,0,0,.5)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 8,
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(150,140,220,.055) 0 1px, transparent 1px 18px), repeating-linear-gradient(0deg, rgba(150,140,220,.055) 0 1px, transparent 1px 18px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 11,
                width: 34,
                height: 24,
                background: "#0a0913",
                border: "1px solid rgba(150,140,220,.16)",
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(150,140,220,.14) 0 1px, transparent 1px 9px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 12,
                right: 13,
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: "#0a0913",
                border: "1px solid rgba(150,140,220,.2)",
              }}
            />
          </div>
        ))}

        {/* themed POIs (flavor, not enterable) */}
        <POILayer />

        {/* the projects mall (walk in, roof lifts) */}
        <GalleriaLayer roofRef={roofRef} units={units} onPad={onPad} />

        {/* Unit 4B — the walk-in studio (roof lifts, mat is inside) */}
        <ApartmentLayer roofRef={aptRoofRef} active={onPad === "about"} />

        {/* Terminal Park Station — the walk-in ticket hall (mat is inside) */}
        <StationLayer roofRef={stnRoofRef} active={onPad === "resume"} />

        {/* destination buildings */}
        {DESTINATIONS.filter(
          (d) => d.key !== "projects" && d.key !== "about" && d.key !== "resume"
        ).map((d) => (
          <DestinationBldg key={d.key} d={d} active={onPad === d.key} />
        ))}
        <ProjectsPavilion active={onPad === "projects"} />

        {/* cars */}
        {carList.map((c, i) => {
          const horiz = c.dx !== 0;
          return (
            <div
              key={`car${i}`}
              id={`nc-car-${i}`}
              ref={(el) => {
                carEls.current[i] = el;
              }}
              className={styles.car}
              style={{
                width: horiz ? 34 : 15,
                height: horiz ? 15 : 34,
                background: `linear-gradient(${
                  horiz ? "90deg" : "0deg"
                }, ${hueColor(c.hue, 0.7, 0.16)}, rgba(225,236,255,.9), ${hueColor(
                  c.hue,
                  0.7,
                  0.16
                )})`,
                boxShadow: `0 0 14px ${hueColor(c.hue, 0.7, 0.15, 0.6)}`,
              }}
            />
          );
        })}

        {/* train */}
        {[0, 1, 2].map((i) => (
          <div
            key={`tc${i}`}
            id={`nc-train-car-${i}`}
            ref={(el) => {
              trainEls.current[i] = el;
            }}
            style={{ zIndex: 51 }}
            className={styles.trainCar}
          >
            <div className={styles.trainWin} />
          </div>
        ))}

        {/* ?dev=1 collider overlay — draws SOLIDS/CIRCLES over the art */}
        {colliders && <CollisionDebugLayer />}

        {/* character — the mock-up "person" (28×28 box centered on position) */}
        <div
          ref={charRef}
          id="nc-player"
          className={styles.char}
          style={{
            transform: `translate(${SPAWN.x - 14}px, ${SPAWN.y - 14}px)`,
          }}
        >
          <div className={styles.charShadow} />
          <div className={styles.ring} />
          <div ref={avatarRef} className={styles.avatar}>
            <div className={styles.legA} />
            <div className={styles.legB} />
            <div className={styles.footA} />
            <div className={styles.footB} />
            <div className={styles.torso} />
            <div className={styles.head} />
            <div className={styles.nose} />
          </div>
        </div>
      </div>
    ),
    // refs/cars/name are stable; onPad drives the pad glow, and
    // roof-lift variant (dev only, rare), units come from the project list
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPad, name, units, colliders]
  );

  return (
    <div
      ref={stageRef}
      role="main"
      aria-label="Neon City, a walkable portfolio overworld"
      className={`${styles.stage}${introPhase !== "done" ? ` ${styles.introFreeze}` : ""}`}
    >
      {dev && (
        <CityDevPanel colliders={colliders} onColliders={pickColliders} />
      )}
      {world}

      {/* ---- overlays ---- */}
      <div ref={daytintRef} className={styles.daytint} style={{ opacity: 0 }} />
      <div className={styles.vignette} />
      <div className={styles.scan} />

      {/* ---- cinematic intro: letterbox + caption + skip ---- */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 58,
          background: "#04030a",
          zIndex: 22,
          transform:
            introPhase === "done" ? "translateY(-101%)" : "translateY(0)",
          transition: "transform .9s ease",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 58,
          background: "#04030a",
          zIndex: 22,
          transform:
            introPhase === "done" ? "translateY(101%)" : "translateY(0)",
          transition: "transform .9s ease",
          pointerEvents: "none",
        }}
      />
      {introPhase !== "done" && (
        <>
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 23,
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              letterSpacing: ".3em",
              color: "rgba(243,237,226,.8)",
              textShadow: "0 0 14px rgba(243,237,226,.35)",
              whiteSpace: "nowrap",
            }}
          >
            {introPhase === "ride" ? caption : "STEPPING OFF · WELCOME"}
          </div>
          <button
            type="button"
            onClick={skipIntro}
            data-hud
            style={{
              position: "absolute",
              bottom: 14,
              right: 22,
              zIndex: 23,
              fontFamily: "var(--font-mono), monospace",
              fontSize: 10,
              letterSpacing: ".18em",
              color: "rgba(243,237,226,.7)",
              background: "transparent",
              border: "1px solid rgba(243,237,226,.3)",
              borderRadius: 999,
              padding: "7px 14px",
              cursor: "pointer",
            }}
          >
            SKIP ▸
          </button>
        </>
      )}

      {/* ---- HUD ---- */}
      <div
        className={styles.hud}
        data-hud
        style={{
          opacity: introPhase === "done" ? 1 : 0,
          pointerEvents: introPhase === "done" ? undefined : "none",
          transition: "opacity .6s ease",
        }}
      >
        <span className={`${styles.bk} ${styles.bkTL}`} />
        <span className={`${styles.bk} ${styles.bkTR}`} />
        <span className={`${styles.bk} ${styles.bkBL}`} />
        <span className={`${styles.bk} ${styles.bkBR}`} />

        <div className={styles.topLeft}>
          <div className={styles.wordmark}>
            {first} {last && <i>{last}</i>}
          </div>
          <div className={styles.subline}>NEON CITY · STREET LEVEL</div>
          <div className={styles.subline}>
            {arrived ? (
              <span className={styles.arrived}>
                &gt; arrived: terminal_park_
              </span>
            ) : (
              "ALTITUDE 0M · TERMINAL PARK"
            )}
          </div>
          {hits > 0 && (
            <div className={styles.incidents}>
              TRAFFIC INCIDENTS · {String(hits).padStart(2, "0")}
            </div>
          )}
        </div>

        <div className={styles.clock}>
          <span
            className={styles.clockDot}
            style={{ background: clock.dot, boxShadow: `0 0 8px ${clock.dot}` }}
          />
          {clock.label}
        </div>

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

        {!everMoved && !panel && introPhase === "done" && (
          <div id="nc-hint" className={styles.hint}>
            {isTouch
              ? "DRAG THE STICK · OR TAP THE STREET"
              : "WALK WITH WASD · OR CLICK THE STREET"}
          </div>
        )}

        {/* teaser popover */}
        {activePanel?.teaser && (
          <div
            id="nc-teaser"
            className={styles.teaser}
            style={{ "--tc": HUES[activePanel.hue] } as CSSProperties}
          >
            <span className={`${styles.teaserBk} ${styles.teaserTL}`} />
            <span className={`${styles.teaserBk} ${styles.teaserBR}`} />
            <button
              type="button"
              className={styles.teaserClose}
              onClick={() => {
                if (onPadRef.current) dismissed.current.add(onPadRef.current);
                panelRef.current = null;
                setPanel(null);
              }}
              aria-label="close"
            >
              ✕
            </button>
            <div className={styles.teaserKicker}>
              {activePanel.teaser.kicker}
            </div>
            <h2 className={styles.teaserTitle}>{activePanel.teaser.title}</h2>
            <p className={styles.teaserBlurb}>{activePanel.teaser.blurb}</p>
            <a href={activePanel.href} className={styles.teaserCta}>
              {activePanel.teaser.cta}
              <span className={styles.cursor} />
            </a>
            <div className={styles.teaserHint}>↵ ENTER · ESC WALK AWAY</div>
          </div>
        )}

        {isTouch && introPhase === "done" && (
          <TouchJoystick
            onStart={() => {
              target.current = null;
              path.current = [];
              ftGlide.current = null;
              if (!everMoved) setEverMoved(true);
            }}
            onVector={(v) => {
              joy.current = v;
            }}
          />
        )}

        {/* fast-travel bar */}
        {isTouch ? (
          <FastTravelDrawer activeKey={panel} onTravel={fastTravel} />
        ) : (
          <div id="nc-fastbar" className={styles.fastbar}>
            {FAST_TRAVEL_ITEMS.map((it) => (
              <button
                key={it.key}
                id={`nc-fasttravel-${it.key}`}
                type="button"
                className={`${styles.ftBtn} ${
                  it.key === "home"
                    ? styles.ftHome
                    : panel === it.key
                      ? styles.ftActive
                      : ""
                }`}
                onClick={() => fastTravel(it.key)}
              >
                {it.hue !== null && (
                  <HueDot hue={it.hue} className={styles.ftDot} />
                )}
                {it.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- static sub-layers ---------- */

function RailLayer() {
  // curved Adkins Line, drawn as layered strokes (shadow, glow, core, dark, ties)
  return (
    <svg
      id="nc-train-tracks"
      width={WORLD.w}
      height={WORLD.h}
      viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 50,
        overflow: "visible",
      }}
    >
      <path
        id="nc-rail-shadow"
        d="M 734 1682 C 764 1502 814 1442 784 1322 C 759 1217 614 1192 604 1052 C 597 952 694 927 694 832 L 694 480 C 694 350 654 280 574 220 C 484 150 394 100 334 -20"
        stroke="rgba(0,0,0,.35)"
        strokeWidth={12}
        fill="none"
        filter="blur(4px)"
        opacity={0.7}
      />
      <path
        id="nc-rail-halo"
        d={RAIL_PATH}
        stroke="rgba(120,110,210,.14)"
        strokeWidth={22}
        fill="none"
      />
      <path
        id="nc-rail-deck"
        d={RAIL_PATH}
        stroke="rgba(150,140,220,.45)"
        strokeWidth={13}
        fill="none"
      />
      <path
        id="nc-rail-bed"
        d={RAIL_PATH}
        stroke="#0d0b18"
        strokeWidth={7}
        fill="none"
      />
      <path
        id="nc-rail-ties"
        d={RAIL_PATH}
        stroke="rgba(150,140,220,.3)"
        strokeWidth={13}
        fill="none"
        strokeDasharray="3 15"
      />
    </svg>
  );
}

function StreetLayer() {
  // curved decorative streets — all connected, routed around the buildings
  const curved = [
    "M 250 340 C 210 560 300 660 285 830 C 270 1010 430 1090 490 1260 C 540 1400 490 1500 510 1600",
    "M 1880 340 C 2010 420 2100 480 2085 700 C 2075 880 1990 960 1900 1050 C 1800 1150 1690 1190 1560 1270 C 1420 1360 1330 1420 1310 1600",
    "M 412 1130 C 680 1098 950 1128 1250 1128 C 1470 1126 1700 1096 1900 1040",
    "M 252 -40 C 262 20 292 62 320 100 C 700 240 1150 120 1500 190 C 1720 230 1850 140 2010 130 C 2080 127 2120 200 2120 282",
  ];
  // short connector roads — narrower than the main curves (60/56 vs 68/64)
  const spurs = [
    "M 1010 340 C 1030 430 1070 490 1090 556", // arterial → park roundabout
    "M 2085 700 C 2220 688 2350 700 2500 702", // east curve → Galleria entrance
  ];
  return (
    <>
      <svg
        width={WORLD.w}
        height={WORLD.h}
        viewBox={`0 0 ${WORLD.w} ${WORLD.h}`}
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      >
        {/* outline pass */}
        {curved.map((d, i) => (
          <path
            key={`so${i}`}
            id={`nc-street-outline-${i}`}
            d={d}
            stroke="rgba(150,140,220,.13)"
            strokeWidth={68}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        {spurs.map((d, i) => (
          <path
            key={`spo${i}`}
            id={`nc-spur-outline-${i}`}
            d={d}
            stroke="rgba(150,140,220,.13)"
            strokeWidth={60}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        <circle
          id="nc-roundabout"
          cx={1090}
          cy={548}
          r={42}
          fill="#0d0c17"
          stroke="rgba(150,140,220,.13)"
          strokeWidth={2}
        />
        {/* bed pass */}
        {curved.map((d, i) => (
          <path
            key={`sb${i}`}
            id={`nc-street-bed-${i}`}
            d={d}
            stroke="#0d0c17"
            strokeWidth={64}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        {spurs.map((d, i) => (
          <path
            key={`spb${i}`}
            id={`nc-spur-bed-${i}`}
            d={d}
            stroke="#0d0c17"
            strokeWidth={56}
            fill="none"
            strokeLinecap="round"
          />
        ))}
        {/* dashed centerlines */}
        {[...curved, ...spurs].map((d, i) => (
          <path
            key={`sc${i}`}
            id={`nc-street-centerline-${i}`}
            d={d}
            stroke="rgba(243,237,226,.05)"
            strokeWidth={2}
            fill="none"
            strokeDasharray="24 40"
          />
        ))}
        {/* straight arterial — V1 traffic runs here */}
        <path
          d={`M 0 320 L ${WORLD.w} 320`}
          stroke="#0d0c17"
          strokeWidth={78}
          fill="none"
        />
        <path
          d={`M 0 282 L ${WORLD.w} 282`}
          stroke="rgba(150,140,220,.14)"
          strokeWidth={1.5}
          fill="none"
        />
        <path
          d={`M 0 358 L ${WORLD.w} 358`}
          stroke="rgba(150,140,220,.14)"
          strokeWidth={1.5}
          fill="none"
        />
        <path
          d={`M 0 320 L ${WORLD.w} 320`}
          stroke="rgba(243,237,226,.08)"
          strokeWidth={2}
          fill="none"
          strokeDasharray="26 36"
        />
      </svg>
      {/* arterial crosswalks — one at the park spur, one at the Galleria spur */}
      {[986, 2440].map((left) => (
        <div
          key={`xw${left}`}
          id={`nc-crosswalk-${left}`}
          style={{
            position: "absolute",
            left,
            top: 284,
            width: 46,
            height: 72,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(243,237,226,.1) 0 8px, transparent 8px 19px)",
            pointerEvents: "none",
          }}
        />
      ))}
      {/* arterial tag */}
      <div
        id="nc-arterial-tag"
        style={{
          position: "absolute",
          left: 60,
          top: 270,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11,
          letterSpacing: ".24em",
          color: "rgba(150,140,220,.4)",
          pointerEvents: "none",
        }}
      >
        Corellian Run Road
      </div>
    </>
  );
}

function ParkLayer({
  first,
  last,
}: {
  name: string;
  first: string;
  last: string;
}) {
  return (
    <>
      <div
        id="nc-park"
        className={styles.park}
        style={{
          left: PARK.x,
          top: PARK.y,
          width: PARK.w,
          height: PARK.h,
          borderRadius: PARK.radius,
        }}
      >
        <div id="nc-park-ring" className={styles.parkRing} />
        {/* winding paths */}
        <div
          id="nc-park-path-0"
          className={styles.parkPath}
          style={{ left: 14, top: 180, width: 400, transform: "rotate(4deg)" }}
        />
        <div
          id="nc-park-path-1"
          className={styles.parkPath}
          style={{
            left: 392,
            top: 192,
            width: 260,
            transform: "rotate(-7deg)",
          }}
        />
        <div
          id="nc-park-path-2"
          className={styles.parkPath}
          style={{
            left: 428,
            top: 6,
            width: 26,
            height: 200,
            transform: "rotate(6deg)",
          }}
        />
        <div
          id="nc-park-path-3"
          className={styles.parkPath}
          style={{
            left: 404,
            top: 232,
            width: 26,
            height: 212,
            transform: "rotate(-9deg)",
          }}
        />
        {/* plaza circle */}
        <div
          id="nc-plaza-circle"
          style={{
            position: "absolute",
            left: 378,
            top: 170,
            width: 78,
            height: 78,
            borderRadius: "50%",
            background: "#131120",
          }}
        />
        {/* reflecting pond */}
        <div
          id="nc-reflecting-pond"
          style={{
            position: "absolute",
            left: PARK.pond.rx,
            top: PARK.pond.ry,
            width: PARK.pond.d,
            height: PARK.pond.d,
            borderRadius: "50%",
            border: "1px dashed rgba(140,190,235,.22)",
            background: "radial-gradient(circle at 40% 35%, #0e1a24, #0a1219)",
            boxShadow: "inset 0 0 20px rgba(0,0,0,.5)",
          }}
        >
          <div id="nc-pond-fountain" className={styles.fountain}>
            <div className={styles.fountainBasin} />
            {[0, 1.13, 2.26].map((delay) => (
              <div
                key={`ring${delay}`}
                className={styles.fountainRing}
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
            <div className={styles.fountainJet} />
            {/* droplets thrown out on the diagonals, each a half-beat apart */}
            {[
              [11, -11],
              [11, 11],
              [-11, 11],
              [-11, -11],
            ].map(([dx, dy], i) => (
              <div
                key={`drop${i}`}
                className={styles.fountainDrop}
                style={
                  {
                    "--dx": `${dx}px`,
                    "--dy": `${dy}px`,
                    animationDelay: `${i * 0.5}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
        {/* corner label */}
        <div
          id="nc-park-corner-label"
          style={{
            position: "absolute",
            right: 385,
            bottom: 16,
            fontFamily: "var(--font-mono), monospace",
            fontSize: 10,
            letterSpacing: ".4em",
            color: "rgba(140,210,160,.5)",
          }}
        >
          TERMINAL PARK
        </div>
      </div>
      {/* trees */}
      {TREES.map((t, i) => (
        <div
          key={`tree${i}`}
          id={`nc-tree-${i}`}
          className={styles.tree}
          style={{ left: t.x, top: t.y, width: t.r * 2, height: t.r * 2 }}
        />
      ))}
      {/* benches */}
      {BENCHES.map((b, i) => (
        <div
          key={`bench${i}`}
          id={`nc-bench-${i}`}
          className={styles.bench}
          style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
        />
      ))}
      {/* nameplate */}
      <div
        id="nc-park-nameplate"
        className={styles.nameplate}
        style={{ left: PARK.nameplate.x, top: PARK.nameplate.y }}
      >
        <div className={styles.npName}>
          {first} {last && <i>{last}</i>}
        </div>
        <div className={styles.npTag}>software engineer · yogi · gamer</div>
      </div>
      <TerminalStation />
    </>
  );
}

// The end of the Adkins Line: platform, ticket hall, stairs to the street.
// Every rect comes from TERMINAL, which collision reads too.
function TerminalStation() {
  const T = TERMINAL;
  const cyanDim = "oklch(0.85 0.13 190 / .35)";
  const mono = "var(--font-mono), monospace";
  return (
    <>
      {/* platform deck, west of the track */}
      <div
        id="nc-rail-platform"
        style={{
          position: "absolute",
          left: T.platform.x,
          top: T.platform.y,
          width: T.platform.w,
          height: T.platform.h,
          background: "#131120",
          border: `1px solid ${cyanDim}`,
          borderRadius: 4,
          zIndex: 12,
        }}
      >
        <span
          id="nc-platform-name"
          style={{
            position: "absolute",
            left: 9,
            bottom: 15,
            fontFamily: mono,
            fontSize: 8,
            letterSpacing: ".3em",
            color: "oklch(0.85 0.13 190 / .75)",
            writingMode: "vertical-rl",
            zIndex: 30,
          }}
        >
          TERMINAL PARK · ADKINS LINE
        </span>
      </div>
      {/* ramp down to the street, treads running west */}
      <div
        id="nc-terminal-ramp"
        style={{
          position: "absolute",
          left: T.ramp.x,
          top: T.ramp.y,
          width: T.ramp.w,
          height: T.ramp.h,
          zIndex: 12,
          borderRadius: 2,
          // lighter at the street end, darker where it meets the deck, so the
          // ramp reads as climbing rather than lying flat
          background: "linear-gradient(90deg, #100e1c, #1b1730)",
          border: `1px solid ${cyanDim}`,
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(150,140,220,.2) 0 1px, transparent 1px 9px)",
        }}
      />
      {/* railings — the fence that makes the deck a one-way-in space */}
      {T.rails.map((r, i) => (
        <div
          key={`rail${i}`}
          id={`nc-platform-rail-${i}`}
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            zIndex: 14,
            borderRadius: 1,
            background: "#0d0b18",
            border: `1px solid ${cyanDim}`,
            boxShadow: `0 0 8px oklch(0.85 0.13 190 / .18)`,
          }}
        />
      ))}
      {/* turnstile stiles at the ramp mouth — you pass between them */}
      {T.turnstiles.map((s, i) => (
        <div
          key={`stile${i}`}
          id={`nc-turnstile-${i}`}
          style={{
            position: "absolute",
            left: s.x,
            top: s.y,
            width: s.w,
            height: s.h,
            zIndex: 15,
            borderRadius: 2,
            background: "#12101f",
            border: `1px solid ${cyanDim}`,
            boxShadow: `0 0 10px oklch(0.85 0.13 190 / .25)`,
          }}
        >
          {/* the arm, angled across the lane */}
          <div
            id={`nc-turnstile-${i}-arm`}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 11,
              height: 2,
              marginTop: -1,
              borderRadius: 1,
              transformOrigin: "0 50%",
              transform: `rotate(${i === 0 ? 52 : -52}deg)`,
              background: "oklch(0.85 0.13 190 / .7)",
            }}
          />
        </div>
      ))}
    </>
  );
}

// per-destination organic corner radii (from the prototype's spotData)
const SPOT_BR: Record<string, string> = {
  resume: "20px 7px 16px 9px",
  about: "9px 17px 7px 23px",
  contact: "18px 8px 24px 6px",
};
const GRID_BG =
  "repeating-linear-gradient(90deg, rgba(150,140,220,.06) 0 1px, transparent 1px 20px), repeating-linear-gradient(0deg, rgba(150,140,220,.06) 0 1px, transparent 1px 20px)";

function DestinationBldg({ d, active }: { d: Destination; active: boolean }) {
  const accent = `oklch(0.85 0.13 ${d.hue})`;
  const dim = `oklch(0.85 0.13 ${d.hue} / .35)`;
  const glow = `oklch(0.85 0.13 ${d.hue} / .16)`;
  const pr = padRect(d);
  return (
    <>
      <div
        id={`nc-building-${d.key}`}
        style={{
          position: "absolute",
          left: d.x,
          top: d.y,
          width: d.w,
          height: d.h,
          borderRadius: SPOT_BR[d.key],
          background: "#110f1e",
          border: `1px solid ${dim}`,
          boxShadow: `0 0 26px ${glow}, inset 0 0 34px rgba(0,0,0,.55)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 9,
            backgroundImage: GRID_BG,
            pointerEvents: "none",
          }}
        />
        {/* windows */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            width: 20,
            height: 20,
            background: "#0a0913",
            border: "1px solid rgba(150,140,220,.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 44,
            width: 20,
            height: 20,
            background: "#0a0913",
            border: "1px solid rgba(150,140,220,.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            width: 34,
            height: 18,
            background: "#0a0913",
            border: "1px solid rgba(150,140,220,.2)",
          }}
        />
        {/* rooftop fan */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            width: 30,
            height: 30,
            borderRadius: 3,
            background: "#0d0b18",
            border: "1px solid rgba(150,140,220,.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "1px solid rgba(150,140,220,.3)",
              background:
                "conic-gradient(rgba(150,140,220,.28) 0 25%, transparent 25% 50%, rgba(150,140,220,.28) 50% 75%, transparent 75% 100%)",
              animation: "ncFan 3.4s linear infinite",
            }}
          />
        </div>
        {/* antenna + blinking beacon */}
        <div
          style={{
            position: "absolute",
            top: -16,
            left: 26,
            width: 2,
            height: 16,
            background: "rgba(150,140,220,.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -21,
            left: 24,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "oklch(0.72 0.19 25)",
            boxShadow: "0 0 8px oklch(0.72 0.2 25 / .8)",
            animation: "ncBlink 1.5s step-end infinite",
          }}
        />
        {/* lit accent door strip (walk-in buildings draw their own doorway) */}
        {d.door && (
          <div
            id={`nc-door-${d.key}`}
            style={{
              position: "absolute",
              left: d.door.x,
              top: d.door.y,
              width: d.door.w,
              height: d.door.h,
              background: accent,
              boxShadow: `0 0 14px ${accent}`,
              opacity: 0.9,
            }}
          />
        )}
        {/* corner pulse light */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 10px ${accent}`,
            animation: "ncPulse 2.6s ease-in-out infinite",
          }}
        />
        {/* sign plate */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "center",
            justifyContent: "center",
            animation: "ncFlick 7.5s infinite",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 15,
              letterSpacing: ".34em",
              color: accent,
              textShadow: `0 0 16px ${accent}`,
              // long names wrap onto a second line rather than crowding the
              // plate edge to edge. The negative margin cancels the trailing
              // letter-space so wrapped lines still read as centred.
              maxWidth: "86%",
              textAlign: "center",
              lineHeight: 1.4,
              marginRight: "-.34em",
            }}
          >
            {d.sign}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 10,
              letterSpacing: ".26em",
              color: dim,
            }}
          >
            {d.sub}
          </div>
        </div>
      </div>
      {/* entry pad */}
      <div
        id={`nc-pad-${d.key}`}
        style={{
          position: "absolute",
          left: pr.x,
          top: pr.y,
          width: pr.w,
          height: pr.h,
          background: `oklch(0.85 0.13 ${d.hue} / ${active ? 0.28 : 0.16})`,
          border: `1px solid ${accent}`,
          borderRadius: 4,
          animation: "ncPulse 2s ease-in-out infinite",
          boxShadow: active ? `0 0 26px ${glow}` : "none",
          zIndex: 2,
        }}
      />
    </>
  );
}

// Projects — the bespoke park pavilion (land on the LEFT stairs, enter on the RIGHT pad)
function ProjectsPavilion({ active }: { active: boolean }) {
  const d = DESTINATIONS.find((x) => x.key === "projects")!;
  const accent = hueColor(d.hue, 0.85);
  const dim = hueColor(d.hue, 0.85, 0.13, 0.4);
  const pr = padRect(d);
  const dot = (style: CSSProperties) => (
    <div
      style={{
        position: "absolute",
        width: 7,
        height: 7,
        background: hueColor(d.hue, 0.85, 0.13, 0.5),
        ...style,
      }}
    />
  );
  return (
    <>
      <div
        id="nc-building-projects"
        style={{
          position: "absolute",
          left: d.x,
          top: d.y,
          width: d.w,
          height: d.h,
          borderRadius: "12px 18px 10px 16px",
          background: "rgba(17,15,30,.94)",
          border: `1px solid ${dim}`,
          boxShadow: `0 0 26px ${hueColor(d.hue, 0.85, 0.13, 0.16)}, inset 0 0 30px rgba(0,0,0,.55)`,
          zIndex: 3,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 9,
            backgroundImage: GRID_BG,
            pointerEvents: "none",
          }}
        />
        {/* corner + mid-edge dots */}
        {dot({ left: 10, top: 10 })}
        {dot({ right: 10, top: 10 })}
        {dot({ left: 10, bottom: 10 })}
        {dot({ right: 10, bottom: 10 })}
        {dot({
          left: 10,
          top: "50%",
          marginTop: -4,
          background: hueColor(d.hue, 0.85, 0.13, 0.35),
        })}
        {dot({
          right: 10,
          top: "50%",
          marginTop: -4,
          background: hueColor(d.hue, 0.85, 0.13, 0.35),
        })}
        {/* antenna + beacon */}
        <div
          style={{
            position: "absolute",
            top: -16,
            left: 22,
            width: 2,
            height: 16,
            background: "rgba(150,140,220,.35)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -21,
            left: 20,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "oklch(0.72 0.19 25)",
            boxShadow: "0 0 8px oklch(0.72 0.2 25 / .8)",
            animation: "ncBlink 1.5s step-end infinite",
          }}
        />
        {/* right-side entrance door strip */}
        {d.door && (
          <div
            id="nc-door-projects"
            style={{
              position: "absolute",
              left: d.door.x,
              top: d.door.y,
              width: d.door.w,
              height: d.door.h,
              background: accent,
              boxShadow: `0 0 14px ${accent}`,
              opacity: 0.9,
            }}
          />
        )}
        {/* sign plate */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "center",
            justifyContent: "center",
            animation: "ncFlick 7.5s infinite",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 14,
              letterSpacing: ".3em",
              color: accent,
              textShadow: `0 0 16px ${accent}`,
              maxWidth: "86%",
              textAlign: "center",
              lineHeight: 1.4,
              marginRight: "-.3em",
            }}
          >
            {d.sign}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 9,
              letterSpacing: ".22em",
              color: dim,
            }}
          >
            {d.sub}
          </div>
        </div>
      </div>
      {/* entrance pad on the RIGHT — drawn from the same rect the loop tests */}
      <div
        id="nc-pad-projects"
        style={{
          position: "absolute",
          left: pr.x,
          top: pr.y,
          width: pr.w,
          height: pr.h,
          background: hueColor(d.hue, 0.85, 0.13, active ? 0.3 : 0.16),
          border: `1px solid ${accent}`,
          borderRadius: 4,
          animation: "ncPulse 2s ease-in-out infinite",
          boxShadow: active
            ? `0 0 26px ${hueColor(d.hue, 0.85, 0.13, 0.3)}`
            : "none",
          zIndex: 3,
        }}
      />
    </>
  );
}

// Themed flavor POIs (not enterable). Ported from the arrival prototype.
function POILayer() {
  const grid =
    "repeating-linear-gradient(90deg, rgba(150,140,220,.06) 0 1px, transparent 1px 18px), repeating-linear-gradient(0deg, rgba(150,140,220,.06) 0 1px, transparent 1px 18px)";
  const sign = (c: string, text: string, dur: number) => (
    <div
      id={`nc-sign-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
      style={{
        position: "absolute",
        left: "50%",
        bottom: -13,
        transform: "translateX(-50%)",
        fontFamily: "var(--font-mono), monospace",
        fontSize: 10,
        letterSpacing: ".28em",
        whiteSpace: "nowrap",
        color: `oklch(${c})`,
        textShadow: `0 0 12px oklch(${c} / .8)`,
        background: "#0a0913",
        border: `1px solid oklch(${c} / .35)`,
        borderRadius: 3,
        padding: "4px 10px",
        animation: `ncFlick ${dur}s infinite`,
      }}
    >
      {text}
    </div>
  );
  return (
    <>
      {/* MUSEUM (amber) */}
      <div
        id="nc-poi-museum"
        style={{
          position: "absolute",
          left: 520,
          top: 12,
          width: 180,
          height: 96,
          transform: "rotate(-1.2deg)",
          borderRadius: "8px 14px 6px 12px",
          background: "#110f1e",
          border: "1px solid oklch(0.8 0.12 46 / .3)",
          boxShadow: "0 0 18px rgba(0,0,0,.5)",
        }}
      >
        <div
          style={{ position: "absolute", inset: 8, backgroundImage: grid }}
        />
        <div
          style={{
            position: "absolute",
            left: "22%",
            right: "22%",
            bottom: 0,
            height: 14,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(243,237,226,.14) 0 2px, transparent 2px 5px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 20,
            display: "flex",
            justifyContent: "center",
            gap: 14,
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "oklch(0.8 0.12 46 / .55)",
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "oklch(0.8 0.12 46 / .8)",
            boxShadow: "0 0 8px oklch(0.8 0.12 46 / .7)",
            animation: "ncPulse 3.4s ease-in-out infinite",
          }}
        />
        {/* rooftop billboard — sits on the roof, north edge of the world */}
        <div
          id="nc-museum-billboard"
          style={{
            position: "absolute",
            left: "50%",
            top: 12,
            transform: "translateX(-50%)",
            display: "grid",
            placeItems: "center",
            padding: "4px 10px",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 9,
            letterSpacing: ".16em",
            color: "oklch(0.8 0.12 46)",
            background: "#0a0913",
            border: "1px solid oklch(0.8 0.12 46 / .4)",
            borderRadius: 3,
            textShadow: "0 0 10px oklch(0.8 0.12 46 / .8)",
            boxShadow:
              "0 0 16px oklch(0.8 0.12 46 / .28), inset 0 0 10px oklch(0.8 0.12 46 / .12)",
            animation: "ncFlick 5.6s infinite",
          }}
        >
          International Spy
        </div>
        {sign("0.8 0.12 46", "MUSEUM", 7.2)}
      </div>

      {/* CONSTRUCTION / SITE 09 (amber) */}
      <div
        id="nc-poi-construction"
        style={{
          position: "absolute",
          left: 1660,
          top: 36,
          width: 170,
          height: 100,
          transform: "rotate(1.4deg)",
          borderRadius: 6,
          background: "#0e0c19",
          border: "1px dashed oklch(0.8 0.12 46 / .45)",
          boxShadow: "0 0 16px rgba(0,0,0,.5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 8,
            borderRadius: "6px 6px 0 0",
            background:
              "repeating-linear-gradient(45deg, oklch(0.8 0.12 46 / .4) 0 8px, #0e0c19 8px 16px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 18,
            width: 4,
            height: 70,
            background: "oklch(0.8 0.12 46 / .5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 34,
            top: 18,
            width: 78,
            height: 4,
            background: "oklch(0.8 0.12 46 / .5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 104,
            top: 22,
            width: 1,
            height: 26,
            background: "oklch(0.8 0.12 46 / .5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 48,
            width: 9,
            height: 7,
            background: "oklch(0.8 0.12 46 / .6)",
            animation: "ncPulse 2.8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 14,
            bottom: 12,
            width: 30,
            height: 18,
            background: "#0a0913",
            border: "1px solid rgba(150,140,220,.2)",
          }}
        />
        {sign("0.8 0.12 46", "SITE 09", 8.4)}
      </div>

      {/* OBSERVATORY (purple) */}
      <div
        id="nc-poi-observatory"
        style={{
          position: "absolute",
          left: 2140,
          top: 30,
          width: 150,
          height: 150,
          borderRadius: "24px 10px 20px 12px",
          background: "#110f1e",
          border: "1px solid oklch(0.75 0.13 300 / .3)",
          boxShadow: "0 0 18px rgba(0,0,0,.5)",
        }}
      >
        <div
          style={{ position: "absolute", inset: 8, backgroundImage: grid }}
        />
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 22,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "radial-gradient(circle at 42% 36%, #1a1730, #0d0b18)",
            border: "1px solid oklch(0.75 0.13 300 / .5)",
            boxShadow: "inset 0 0 16px rgba(0,0,0,.6)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -2,
              width: 8,
              height: "50%",
              transform: "translateX(-50%) rotate(18deg)",
              transformOrigin: "50% 100%",
              background: "#0a0913",
              border: "1px solid oklch(0.75 0.13 300 / .45)",
              borderBottom: "none",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 14,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "oklch(0.75 0.13 300 / .85)",
            boxShadow: "0 0 10px oklch(0.75 0.13 300 / .7)",
            animation: "ncPulse 3s ease-in-out infinite",
          }}
        />
        {sign("0.75 0.13 300", "OBSERVATORY", 9.1)}
      </div>

      {/* ARCADE (cyan) */}
      <div
        id="nc-poi-arcade"
        style={{
          position: "absolute",
          left: 40,
          top: 410,
          width: 140,
          height: 115,
          transform: "rotate(-1.8deg)",
          borderRadius: "6px 20px 8px 14px",
          background: "#110f1e",
          border: "1px solid oklch(0.85 0.13 190 / .3)",
          boxShadow: "0 0 18px rgba(0,0,0,.5)",
        }}
      >
        <div
          style={{ position: "absolute", inset: 8, backgroundImage: grid }}
        />
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 16,
            display: "flex",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 14,
              height: 18,
              background: "#0a0913",
              border: "1px solid oklch(0.85 0.13 190 / .5)",
            }}
          />
          <div
            style={{
              width: 14,
              height: 18,
              background: "#0a0913",
              border: "1px solid oklch(0.75 0.16 340 / .5)",
            }}
          />
          <div
            style={{
              width: 14,
              height: 18,
              background: "#0a0913",
              border: "1px solid oklch(0.85 0.13 190 / .5)",
            }}
          />
          <div
            style={{
              width: 14,
              height: 18,
              background: "#0a0913",
              border: "1px solid oklch(0.8 0.12 46 / .5)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 14,
            width: 26,
            height: 26,
            borderRadius: 3,
            background: "#0d0b18",
            border: "1px solid rgba(150,140,220,.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "1px solid rgba(150,140,220,.3)",
              background:
                "conic-gradient(rgba(150,140,220,.28) 0 25%, transparent 25% 50%, rgba(150,140,220,.28) 50% 75%, transparent 75% 100%)",
              animation: "ncFan 3s linear infinite",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 10,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "oklch(0.85 0.13 190 / .8)",
            boxShadow: "0 0 8px oklch(0.85 0.13 190 / .7)",
            animation: "ncPulse 2.4s ease-in-out infinite",
          }}
        />
        <div
          id="nc-arcade-billboard"
          style={{
            position: "absolute",
            left: "50%",
            top: 45,
            transform: "translateX(-50%)",
            display: "grid",
            placeItems: "center",
            padding: "4px 10px",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 9,
            letterSpacing: ".16em",
            color: "oklch(0.85 0.13 190)",
            background: "#0a0913",
            border: "1px solid oklch(0.85 0.13 190 / .4)",
            borderRadius: 3,
            textShadow: "0 0 10px oklch(0.85 0.13 190 / .8)",
            boxShadow:
              "0 0 16px oklch(0.85 0.13 190 / .28), inset 0 0 10px oklch(0.85 0.13 190 / .12)",
            animation: "ncFlick 5.6s infinite",
          }}
        >
          AERO CLUB
        </div>
        {sign("0.85 0.13 190", "ARCADE", 6.5)}
      </div>

      {/* BROADCAST TOWER / KNDL FM (cyan) */}
      <div
        id="nc-poi-broadcast-tower"
        style={{
          position: "absolute",
          left: 2050,
          top: 1150,
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: "#110f1e",
          border: "1px solid oklch(0.85 0.13 190 / .3)",
          boxShadow: "0 0 18px rgba(0,0,0,.5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 16,
            borderRadius: "50%",
            border: "1px dashed rgba(150,140,220,.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 34,
            borderRadius: "50%",
            border: "1px dashed rgba(150,140,220,.14)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 44,
            height: 44,
            margin: "-22px 0 0 -22px",
            borderRadius: "50%",
            border: "1px solid oklch(0.85 0.13 190 / .5)",
            animation: "ncRing 2.6s ease-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 10,
            height: 10,
            margin: "-5px 0 0 -5px",
            borderRadius: "50%",
            background: "#0a0913",
            border: "1px solid oklch(0.85 0.13 190 / .7)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 4,
            height: 4,
            margin: "-2px 0 0 -2px",
            borderRadius: "50%",
            background: "oklch(0.72 0.19 25)",
            boxShadow: "0 0 8px oklch(0.72 0.2 25 / .8)",
            animation: "ncBlink 1.5s step-end infinite",
          }}
        />
        {sign("0.85 0.13 190", "KNDL FM", 7.8)}
      </div>

      {/* RAMEN (amber) */}
      <div
        id="nc-poi-ramen"
        style={{
          position: "absolute",
          left: 590,
          top: 1345,
          width: 140,
          height: 95,
          transform: "rotate(1.6deg)",
          borderRadius: "16px 7px 20px 9px",
          background: "#110f1e",
          border: "1px solid oklch(0.8 0.12 46 / .3)",
          boxShadow: "0 0 18px rgba(0,0,0,.5)",
        }}
      >
        <div
          style={{ position: "absolute", inset: 8, backgroundImage: grid }}
        />
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 18,
            width: 22,
            height: 22,
            borderRadius: 3,
            background: "#0a0913",
            border: "1px solid rgba(150,140,220,.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 26,
            top: 6,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "rgba(243,237,226,.5)",
            animation: "ncSteam 2.4s ease-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 33,
            top: 8,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "rgba(243,237,226,.4)",
            animation: "ncSteam 2.4s ease-out infinite",
            animationDelay: ".8s",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 29,
            top: 4,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "rgba(243,237,226,.45)",
            animation: "ncSteam 2.4s ease-out infinite",
            animationDelay: "1.5s",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 14,
            top: 16,
            width: 34,
            height: 14,
            background: "oklch(0.8 0.12 46 / .12)",
            border: "1px solid oklch(0.8 0.12 46 / .4)",
            borderRadius: 2,
          }}
        />
        {sign("0.8 0.12 46", "RAMEN", 6.9)}
      </div>

      {/* NIGHT MARKET (magenta) */}
      <div
        id="nc-poi-night-market"
        style={{
          position: "absolute",
          left: 1450,
          top: 1380,
          width: 200,
          height: 120,
          transform: "rotate(-1.1deg)",
        }}
      >
        {[0, 70, 140].map((lx, i) => (
          <div
            key={lx}
            id={`nc-market-tent-${i}`}
            style={{
              position: "absolute",
              left: lx,
              top: 22,
              width: 58,
              height: 88,
              borderRadius: 6,
              background:
                "repeating-linear-gradient(90deg, oklch(0.75 0.16 340 / .22) 0 9px, #131120 9px 18px)",
              border: "1px solid oklch(0.75 0.16 340 / .35)",
              boxShadow: "0 0 14px rgba(0,0,0,.5)",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 6,
            right: 6,
            top: 8,
            height: 3,
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(243,237,226,.7) 0 3px, transparent 3px 16px)",
            animation: "ncFlicker 8s infinite",
          }}
        />
        {sign("0.75 0.16 340", "NIGHT MARKET", 7.4)}
      </div>

      {/* PIXEL PIER gate (magenta landmark) */}
      <div
        id="nc-pier-halo"
        style={{
          position: "absolute",
          left: 70,
          top: 1210,
          width: 340,
          height: 340,
          borderRadius: "44% 38% 46% 40%",
          border: "1px dashed oklch(0.75 0.16 340 / .18)",
          pointerEvents: "none",
        }}
      />
      <div
        id="nc-poi-pixel-pier"
        style={{
          position: "absolute",
          left: 100,
          top: 1300,
          width: 280,
          height: 170,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 270,
            top: -58,
            width: 76,
            height: 76,
            borderRadius: "50%",
            border: "1px solid oklch(0.75 0.16 340 / .45)",
            background:
              "conic-gradient(oklch(0.75 0.16 340 / .18) 0 12%, transparent 12% 25%, oklch(0.75 0.16 340 / .18) 25% 37%, transparent 37% 50%, oklch(0.75 0.16 340 / .18) 50% 62%, transparent 62% 75%, oklch(0.75 0.16 340 / .18) 75% 87%, transparent 87% 100%)",
            animation: "ncFan 22s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 20,
            top: 100,
            width: 240,
            height: 60,
            border: "1px dashed oklch(0.75 0.16 340 / .3)",
            borderBottom: "none",
            borderRadius: "120px 120px 0 0",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 46,
            top: 60,
            width: 16,
            height: 88,
            background: "#131120",
            border: "1px solid oklch(0.75 0.16 340 / .5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 216,
            top: 60,
            width: 16,
            height: 88,
            background: "#131120",
            border: "1px solid oklch(0.75 0.16 340 / .5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 30,
            top: 26,
            width: 220,
            height: 40,
            borderRadius: 5,
            background: "#0d0b18",
            border: "1px solid oklch(0.75 0.16 340 / .55)",
            boxShadow: "0 0 24px oklch(0.75 0.16 340 / .25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 14,
            letterSpacing: ".34em",
            color: "oklch(0.75 0.16 340)",
            textShadow: "0 0 16px oklch(0.75 0.16 340 / .9)",
            animation: "ncFlicker 7s infinite",
          }}
        >
          PIXEL&nbsp;PIER
        </div>
        <div
          style={{
            position: "absolute",
            left: 112,
            top: 150,
            width: 56,
            height: 16,
            borderRadius: 4,
            background: "oklch(0.75 0.16 340 / .16)",
            border: "1px solid oklch(0.75 0.16 340 / .7)",
            animation: "ncPulse 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* MARINA / DOCKSIDE (cyan) — anchored to the SE corner (offsets from both
          the east and south walls) so it fills the bottom-right waterfront in
          the clear, well below the Galleria, and rides along on any resize. */}
      <div
        id="nc-marina-basin"
        style={{
          position: "absolute",
          left: WORLD.w - 300,
          top: WORLD.h - 372,
          width: 300,
          height: 372,
          borderRadius: "150px 0 0 0",
          background:
            "radial-gradient(120% 110% at 100% 100%, #0e1a24, #0a1219 72%)",
          borderTop: "1px dashed rgba(140,190,235,.25)",
          borderLeft: "1px dashed rgba(140,190,235,.25)",
          boxShadow: "inset 0 0 30px rgba(0,0,0,.5)",
        }}
      />
      {/* dock planks jutting into the basin */}
      <div
        id="nc-marina-plank-0"
        style={{
          position: "absolute",
          left: WORLD.w - 176,
          top: WORLD.h - 250,
          width: 96,
          height: 12,
          background: "#131120",
          border: "1px solid rgba(150,140,220,.28)",
        }}
      />
      <div
        id="nc-marina-plank-1"
        style={{
          position: "absolute",
          left: WORLD.w - 150,
          top: WORLD.h - 120,
          width: 70,
          height: 12,
          background: "#131120",
          border: "1px solid rgba(150,140,220,.28)",
        }}
      />
      {/* moored buoy */}
      <div
        id="nc-marina-buoy"
        style={{
          position: "absolute",
          left: WORLD.w - 58,
          top: WORLD.h - 190,
          width: 11,
          height: 20,
          borderRadius: 5,
          background: "#131120",
          border: "1px solid oklch(0.85 0.13 190 / .5)",
          animation: "ncPulse 4s ease-in-out infinite",
        }}
      />
      <div
        id="nc-marina-label"
        style={{
          position: "absolute",
          left: WORLD.w - 214,
          top: WORLD.h - 404,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 10,
          letterSpacing: ".28em",
          color: "oklch(0.85 0.13 190 / .8)",
          textShadow: "0 0 12px oklch(0.85 0.13 190 / .6)",
          background: "#0a0913",
          border: "1px solid oklch(0.85 0.13 190 / .3)",
          borderRadius: 3,
          padding: "4px 10px",
          animation: "ncFlick 8.8s infinite",
        }}
      >
        MARINA
      </div>
    </>
  );
}
