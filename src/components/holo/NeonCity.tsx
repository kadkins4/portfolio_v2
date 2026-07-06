"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  WORLD,
  CHAR_R,
  MARGIN,
  SPAWN,
  ROADS_H,
  ROADS_V,
  ROAD_W,
  NODES,
  RAIL,
  railPoint,
  PARK,
  DESTINATIONS,
  padRect,
  FILLERS,
  TREES,
  BENCHES,
  LAMPS,
  DISTRICT_LABELS,
  HUES,
  hueColor,
  type Destination,
  type Car,
} from "@/lib/cityData";
import styles from "./neonCity.module.css";

const BONK_WORDS = ["BONK!", "OOF!", "HEY!", "WATCH IT!"];

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

// axis-aligned solids the player collides with (buildings, fillers, benches)
type Rect = { x: number; y: number; w: number; h: number };
const SOLIDS: Rect[] = [
  ...DESTINATIONS.map((d) => ({ x: d.x, y: d.y, w: d.w, h: d.h })),
  ...FILLERS.map((f) => ({ x: f.x, y: f.y, w: f.w, h: f.h })),
  ...BENCHES,
];

function hitsSolid(x: number, y: number): boolean {
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

// initial traffic — straight lanes, right-hand offsets so opposing cars separate
function seedCars(): Car[] {
  const cars: Car[] = [];
  const S = 2.4;
  // horizontal road y=360
  cars.push({ x: 100, y: 378, dx: S, dy: 0, hue: 190 });
  cars.push({ x: 900, y: 378, dx: S, dy: 0, hue: 46 });
  cars.push({ x: 1600, y: 342, dx: -S, dy: 0, hue: 340 });
  // horizontal road y=1040
  cars.push({ x: 500, y: 1058, dx: S, dy: 0, hue: 190 });
  cars.push({ x: 2000, y: 1022, dx: -S, dy: 0, hue: 46 });
  // vertical road x=320
  cars.push({ x: 302, y: 200, dx: 0, dy: S, hue: 46 });
  cars.push({ x: 338, y: 1300, dx: 0, dy: -S, hue: 190 });
  // vertical road x=1880
  cars.push({ x: 1862, y: 700, dx: 0, dy: S, hue: 340 });
  cars.push({ x: 1898, y: 1400, dx: 0, dy: -S, hue: 190 });
  cars.push({ x: 1898, y: 500, dx: 0, dy: -S, hue: 46 });
  return cars;
}

export default function NeonCity({
  name = "Kendall Adkins",
}: {
  name?: string;
}) {
  const router = useRouter();
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
  const target = useRef<{ x: number; y: number } | null>(null);
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
  const cars = useRef<Car[]>(seedCars());
  const train = useRef({ s: 400, dwell: 0, dwelled: false });
  const invuln = useRef(0);
  const cam = useRef({ x: 0, y: 0 });
  const panelRef = useRef<string | null>(null);
  const dismissed = useRef<Set<string>>(new Set());
  const onPadRef = useRef<string | null>(null);
  const start = useRef(0);

  // --- reactive state (HUD only) ---
  const [panel, setPanel] = useState<string | null>(null);
  const [onPad, setOnPad] = useState<string | null>(null);
  const [hits, setHits] = useState(0);
  const [everMoved, setEverMoved] = useState(false);
  const [arrived, setArrived] = useState(true);
  const [clock, setClock] = useState({
    label: "00:00 · NIGHT",
    dot: "#aab4e8",
  });

  const dest = useMemo(
    () => Object.fromEntries(DESTINATIONS.map((d) => [d.key, d])),
    []
  );

  // arrival beat fades after ~4.6s
  useEffect(() => {
    const t = window.setTimeout(() => setArrived(false), 4600);
    return () => window.clearTimeout(t);
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
      const d = dest[key];
      if (!d) return;
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
        ftGlide.current = null;
        markMoved();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (KEYMAP[k]) keys.current.delete(KEYMAP[k]);
    };
    const onClick = (e: MouseEvent) => {
      // ignore clicks that land on HUD chrome (buttons/teaser handle themselves)
      if ((e.target as HTMLElement).closest("[data-hud]")) return;
      const wx = e.clientX + cam.current.x;
      const wy = e.clientY + cam.current.y;
      target.current = { x: wx, y: wy };
      ftGlide.current = null;
      markMoved();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    stageRef.current?.addEventListener("click", onClick);

    start.current = performance.now();
    let lastNow = performance.now();
    let stuck = 0;
    let raf = 0;

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
      const g = ftGlide.current;
      if (g) {
        // fast-travel: eased position glide over ~0.95s, ignores collision
        if (g.t0 === null) g.t0 = now;
        const prog = Math.min(1, (now - g.t0) / 950);
        const e =
          prog < 0.5 ? 2 * prog * prog : 1 - Math.pow(-2 * prog + 2, 2) / 2;
        p.x = g.fromX + (g.toX - g.fromX) * e;
        p.y = g.fromY + (g.toY - g.fromY) * e;
        p.ang = (Math.atan2(g.toY - g.fromY, g.toX - g.fromX) * 180) / Math.PI;
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
            target.current = null;
          } else {
            vx = (dx / dist) * step;
            vy = (dy / dist) * step;
          }
        } else {
          if (keys.current.has("up")) vy -= 1;
          if (keys.current.has("down")) vy += 1;
          if (keys.current.has("left")) vx -= 1;
          if (keys.current.has("right")) vx += 1;
          if (vx && vy) {
            vx *= 0.72;
            vy *= 0.72;
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
              stuck = 0;
            }
          } else {
            stuck = 0;
          }
        } else {
          stuck = 0;
        }
      }
      p.moving = moving;

      // ---- camera ----
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      cam.current.x = Math.max(0, Math.min(WORLD.w - vw, p.x - vw / 2));
      cam.current.y = Math.max(0, Math.min(WORLD.h - vh, p.y - vh / 2));
      if (worldRef.current)
        worldRef.current.style.transform = `translate(${-cam.current.x}px, ${-cam.current.y}px)`;

      // ---- avatar ----
      if (charRef.current)
        charRef.current.style.transform = `translate(${p.x - 14}px, ${
          p.y - 14
        }px)`;
      if (avatarRef.current)
        avatarRef.current.style.transform = `rotate(${p.ang}deg)`;
      if (charRef.current) {
        const cls = charRef.current.classList;
        if (moving) cls.add(styles.walking);
        else cls.remove(styles.walking);
      }

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
          if (c.x > 2460) c.x = -60;
          if (c.x < -60) c.x = 2460;
          if (c.y > 1660) c.y = -60;
          if (c.y < -60) c.y = 1660;
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

      // ---- train ---- (dwell is time-based ms so it holds ~2.4s at any fps)
      const tr = train.current;
      if (tr.dwell > 0) {
        tr.dwell -= dt;
      } else {
        const dist = Math.abs(tr.s - RAIL.stationScalar);
        let sp = 3.4;
        if (dist < 300) sp = 3.4 * (0.16 + 0.84 * (dist / 300));
        const prev = tr.s;
        tr.s += sp * f;
        if (
          !tr.dwelled &&
          prev < RAIL.stationScalar &&
          tr.s >= RAIL.stationScalar
        ) {
          tr.dwell = 2400;
          tr.dwelled = true;
        }
      }
      if (tr.s > RAIL.wrapMax) {
        tr.s = RAIL.wrapMin;
        tr.dwelled = false;
      }
      for (let i = 0; i < 3; i++) {
        const sc = tr.s - i * 76;
        const pt = railPoint(sc);
        const el = trainEls.current[i];
        if (el)
          el.style.transform = `translate(${pt.x - 34}px, ${
            pt.y - 10
          }px) rotate(${RAIL.angleDeg}deg)`;
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
      stageRef.current?.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fast-travel: glide to a pad then open its teaser (Home leaves the city)
  function fastTravel(key: string) {
    if (key === "home") {
      router.push("/");
      return;
    }
    const d = dest[key];
    if (!d) return;
    // eased camera+character glide straight to the pad, then auto-open teaser
    target.current = null;
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

  const activePanel = panel ? dest[panel] : null;

  // The static world (~300 nodes) only depends on `onPad` for the pad glow;
  // memoizing it keeps the 1Hz clock tick and teaser state from reconciling
  // the whole city every render. Per-frame motion is imperative via refs.
  const world = useMemo(
    () => (
      <div ref={worldRef} className={styles.world}>
        {/* district ground blobs */}
        <div
          className={styles.blob}
          style={{
            left: 40,
            top: 40,
            width: 900,
            height: 900,
            background: hueColor(190, 0.5, 0.13, 0.05),
          }}
        />
        <div
          className={styles.blob}
          style={{
            left: 1820,
            top: 40,
            width: 640,
            height: 760,
            background: hueColor(46, 0.5, 0.14, 0.05),
          }}
        />
        <div
          className={styles.blob}
          style={{
            left: 700,
            top: 1120,
            width: 900,
            height: 560,
            background: hueColor(300, 0.5, 0.11, 0.05),
          }}
        />

        {/* district ground labels */}
        {DISTRICT_LABELS.map((l) => (
          <div
            key={l.text}
            className={styles.districtLabel}
            style={{
              left: l.x,
              top: l.y,
              color: hueColor(l.hue, 0.85, 0.13, 0.22),
              transform: `rotate(${l.rot}deg)`,
            }}
          >
            {l.text}
          </div>
        ))}

        {/* rail: shadow, promenade, track, pillars */}
        <RailLayer />

        {/* streets */}
        {ROADS_H.map((y) => (
          <div
            key={`rh${y}`}
            className={styles.roadH}
            style={{
              left: 0,
              top: y - ROAD_W / 2,
              width: WORLD.w,
              height: ROAD_W,
            }}
          />
        ))}
        {ROADS_V.map((x) => (
          <div
            key={`rv${x}`}
            className={styles.roadV}
            style={{
              left: x - ROAD_W / 2,
              top: 0,
              width: ROAD_W,
              height: WORLD.h,
            }}
          />
        ))}
        <LaneLines />
        {NODES.map((n, i) => (
          <div
            key={`nd${i}`}
            className={styles.node}
            style={{ left: n.x - 40, top: n.y - 40 }}
          />
        ))}
        <Crosswalks />

        {/* traffic lights (one per node, EW+NS lamps) */}
        {NODES.map((n, i) => (
          <TrafficLight key={`tl${i}`} x={n.x} y={n.y} />
        ))}

        {/* lamps (brighten at night) */}
        <div ref={lampWrapRef}>
          {LAMPS.map((l, i) => (
            <div key={`lp${i}`}>
              <div
                className={styles.lampPool}
                style={{ left: l.x, top: l.y }}
              />
              <div
                className={styles.lampCore}
                style={{ left: l.x - 3, top: l.y - 3 }}
              />
            </div>
          ))}
        </div>

        {/* Terminal Park */}
        <ParkLayer name={name} first={first} last={last} />

        {/* filler buildings */}
        {FILLERS.map((f, i) => (
          <div
            key={`f${i}`}
            className={styles.filler}
            style={{
              left: f.x,
              top: f.y,
              width: f.w,
              height: f.h,
              borderRadius: i % 2 ? "3px 8px 4px 10px" : "9px 3px 11px 4px",
              transform: `rotate(${((i % 5) - 2) * 0.6}deg)`,
            }}
          >
            <div className={styles.bldgRoof} />
            <div
              className={styles.beacon}
              style={{ right: 8, top: 8, background: "oklch(0.72 0.19 340)" }}
            />
            <div
              className={styles.fillerSign}
              style={{ color: hueColor(f.hue, 0.84, 0.14) }}
            >
              {f.sign}
            </div>
          </div>
        ))}

        {/* destination buildings */}
        {DESTINATIONS.map((d) => (
          <DestinationBldg key={d.key} d={d} active={onPad === d.key} />
        ))}

        {/* cars */}
        {cars.current.map((c, i) => {
          const horiz = c.dx !== 0;
          return (
            <div
              key={`car${i}`}
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
            ref={(el) => {
              trainEls.current[i] = el;
            }}
            className={styles.trainCar}
          >
            <div className={styles.trainWin} />
          </div>
        ))}

        {/* character — the mock-up "person" (28×28 box centered on position) */}
        <div
          ref={charRef}
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
    // refs/cars/name are stable; only onPad changes the rendered world
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPad, name]
  );

  return (
    <div ref={stageRef} className={styles.stage}>
      {world}

      {/* ---- overlays ---- */}
      <div ref={daytintRef} className={styles.daytint} style={{ opacity: 0 }} />
      <div className={styles.vignette} />
      <div className={styles.scan} />

      {/* ---- HUD ---- */}
      <div className={styles.hud} data-hud>
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
          <div>WASD / ARROWS · WALK</div>
          <div>CLICK THE STREET · WALK THERE</div>
          <div>STEP ON A PAD · ENTER</div>
        </div>

        {!everMoved && !panel && (
          <div className={styles.hint}>
            WALK WITH WASD · OR CLICK THE STREET
          </div>
        )}

        {/* teaser popover */}
        {activePanel && (
          <div
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

        {/* fast-travel bar */}
        <div className={styles.fastbar}>
          <button
            type="button"
            className={`${styles.ftBtn} ${styles.ftHome}`}
            onClick={() => fastTravel("home")}
          >
            ~/overwatch
          </button>
          {DESTINATIONS.map((d) => (
            <button
              key={d.key}
              type="button"
              className={`${styles.ftBtn} ${
                panel === d.key ? styles.ftActive : ""
              }`}
              onClick={() => fastTravel(d.key)}
            >
              <span
                className={styles.ftDot}
                style={{
                  background: HUES[d.hue],
                  boxShadow: `0 0 6px ${HUES[d.hue]}`,
                }}
              />
              {d.key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- static sub-layers ---------- */

function RailLayer() {
  const cx = RAIL.x0 + (RAIL.length / 2) * RAIL.ux;
  const cy = RAIL.y0 + (RAIL.length / 2) * RAIL.uy;
  const common: CSSProperties = {
    left: cx - RAIL.length / 2,
    width: RAIL.length,
    transform: `rotate(${RAIL.angleDeg}deg)`,
  };
  const pillars = [];
  for (let s = 100; s < RAIL.length; s += 210) {
    const pt = railPoint(s);
    pillars.push(
      <div
        key={`pil${s}`}
        className={styles.pillar}
        style={{ left: pt.x, top: pt.y + 6 }}
      />
    );
  }
  return (
    <>
      <div
        className={styles.railShadow}
        style={{ ...common, top: cy - 10 + 29 }}
      />
      <div className={styles.promenade} style={{ ...common, top: cy - 26 }} />
      {pillars}
      <div className={styles.rail} style={{ ...common, top: cy - 7 }} />
    </>
  );
}

function LaneLines() {
  const segs: ReactNode[] = [];
  // horizontal pink lanes on each H road, broken at V roads
  for (const y of ROADS_H) {
    const gaps = [
      [0, 280],
      [360, 1840],
      [1920, WORLD.w],
    ];
    gaps.forEach(([a, b], i) => {
      segs.push(
        <div
          key={`lh${y}-${i}`}
          className={`${styles.lane} ${styles.laneH}`}
          style={{ left: a, top: y - 1, width: b - a }}
        />
      );
    });
  }
  // vertical lanes on each V road, broken at H roads
  const vColor = (x: number) =>
    x === 320 ? styles.laneVcyan : styles.laneVamber;
  for (const x of ROADS_V) {
    const gaps = [
      [0, 320],
      [400, 1000],
      [1080, WORLD.h],
    ];
    gaps.forEach(([a, b], i) => {
      segs.push(
        <div
          key={`lv${x}-${i}`}
          className={`${styles.lane} ${vColor(x)}`}
          style={{ left: x - 1, top: a, height: b - a }}
        />
      );
    });
  }
  return <>{segs}</>;
}

function Crosswalks() {
  const cw: ReactNode[] = [];
  NODES.forEach((n, i) => {
    // horizontal-road approaches (left + right of node) → vertical stripes
    cw.push(
      <div
        key={`cwL${i}`}
        className={`${styles.crosswalk} ${styles.cwV}`}
        style={{ left: n.x - 40 - 26, top: n.y - 36, width: 26, height: 72 }}
      />,
      <div
        key={`cwR${i}`}
        className={`${styles.crosswalk} ${styles.cwV}`}
        style={{ left: n.x + 40, top: n.y - 36, width: 26, height: 72 }}
      />,
      <div
        key={`cwT${i}`}
        className={`${styles.crosswalk} ${styles.cwH}`}
        style={{ left: n.x - 36, top: n.y - 40 - 26, width: 72, height: 26 }}
      />,
      <div
        key={`cwB${i}`}
        className={`${styles.crosswalk} ${styles.cwH}`}
        style={{ left: n.x - 36, top: n.y + 40, width: 72, height: 26 }}
      />
    );
  });
  return <>{cw}</>;
}

function TrafficLight({ x, y }: { x: number; y: number }) {
  return (
    <>
      <div className={styles.light} style={{ left: x - 52, top: y - 52 }}>
        <span
          className={styles.lamp2}
          style={{ background: "oklch(0.6 0.14 25)" }}
        />
        <span
          className={styles.lamp2}
          style={{
            background: "oklch(0.78 0.19 150)",
            boxShadow: "0 0 8px oklch(0.78 0.19 150)",
          }}
        />
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
        className={styles.park}
        style={{
          left: PARK.x,
          top: PARK.y,
          width: PARK.w,
          height: PARK.h,
          borderRadius: PARK.radius,
        }}
      >
        <div className={styles.parkRing} />
      </div>
      {/* winding paths meeting at a plaza */}
      <div
        className={styles.parkPath}
        style={{
          left: PARK.x + 60,
          top: PARK.y + 200,
          width: 320,
          transform: "rotate(-6deg)",
        }}
      />
      <div
        className={styles.parkPath}
        style={{
          left: PARK.x + 260,
          top: PARK.y + 120,
          width: 300,
          transform: "rotate(78deg)",
        }}
      />
      <div
        className={styles.plaza}
        style={{ left: PARK.x + 330, top: PARK.y + 225 }}
      />
      {/* trees */}
      {TREES.map((t, i) => (
        <div
          key={`tree${i}`}
          className={styles.tree}
          style={{ left: t.x, top: t.y, width: t.r * 2, height: t.r * 2 }}
        />
      ))}
      {/* benches */}
      {BENCHES.map((b, i) => (
        <div
          key={`bench${i}`}
          className={styles.bench}
          style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
        />
      ))}
      {/* nameplate */}
      <div
        className={styles.nameplate}
        style={{ left: PARK.nameplate.x, top: PARK.nameplate.y }}
      >
        <div className={styles.npName}>
          {first} {last && <i>{last}</i>}
        </div>
        <div className={styles.npTag}>ENGINEER BY DAY · HUMAN BY DESIGN</div>
      </div>
      {/* station platform under the rail */}
      <div
        className={styles.platform}
        style={{
          left: PARK.platform.x - PARK.platform.w / 2,
          top: PARK.platform.y - PARK.platform.h / 2,
          width: PARK.platform.w,
          height: PARK.platform.h,
          transform: `rotate(${RAIL.angleDeg}deg)`,
        }}
      >
        <span className={styles.platformLabel}>TERMINAL · ADKINS LINE</span>
      </div>
    </>
  );
}

function DestinationBldg({ d, active }: { d: Destination; active: boolean }) {
  const acc = hueColor(d.hue, 0.85, 0.13);
  const dim = hueColor(d.hue, 0.7, 0.12, 0.45);
  const glow = hueColor(d.hue, 0.7, 0.13, 0.18);
  const pr = padRect(d);
  return (
    <>
      <div
        className={styles.bldg}
        style={{
          left: d.x,
          top: d.y,
          width: d.w,
          height: d.h,
          border: `1px solid ${dim}`,
          borderRadius: "10px 4px 12px 5px",
          boxShadow: `0 0 26px ${glow}, inset 0 0 34px rgba(0,0,0,.55)`,
        }}
      >
        <div className={styles.bldgRoof} />
        {/* roof furniture */}
        <div className={styles.antenna} style={{ right: 24, top: -20 }} />
        <div className={styles.beacon} style={{ right: 21, top: -22 }} />
        <div className={styles.fan} style={{ left: 20, top: 18 }} />
        <div
          className={styles.bldgLabel}
          style={{ color: acc, textShadow: `0 0 12px ${acc}` }}
        >
          <span className={styles.bldgSign}>{d.sign}</span>
          <span className={styles.bldgSub}>{d.sub}</span>
        </div>
      </div>
      {/* entry pad */}
      <div
        className={styles.pad}
        style={{
          left: pr.x,
          top: pr.y,
          width: pr.w,
          height: pr.h,
          border: `1px solid ${acc}`,
          background: hueColor(d.hue, 0.7, 0.13, active ? 0.28 : 0.14),
          boxShadow: active ? `0 0 26px ${glow}` : "none",
        }}
      />
    </>
  );
}
