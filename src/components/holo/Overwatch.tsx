"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./overwatch.module.css";

// The root "/" experience: a HUD hovering over the neon city at altitude.
// Quick-links jump straight to the pages; "descend into the city_" plays the
// camera-drop and routes into the walkable /city.
export default function Overwatch({
  name = "Kendall Adkins",
}: {
  name?: string;
}) {
  const router = useRouter();
  const [first, ...rest] = name.split(" ");
  const last = rest.join(" ");
  const [fit, setFit] = useState(1);
  const [dropping, setDropping] = useState(false);
  const dropTimer = useRef<number | null>(null);

  useEffect(() => {
    // rAF-coalesce resize so a drag doesn't flood React with re-renders
    let raf = 0;
    const measure = () =>
      setFit(Math.min(window.innerWidth / 1140, window.innerHeight / 720, 1.4));
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // cancel a pending descent if we unmount first (e.g. user taps a nav chip)
  useEffect(
    () => () => {
      if (dropTimer.current !== null) window.clearTimeout(dropTimer.current);
    },
    []
  );

  function descend() {
    if (dropping) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) {
      router.push("/city");
      return;
    }
    setDropping(true);
    dropTimer.current = window.setTimeout(() => router.push("/city"), 1700);
  }

  return (
    <div className={styles.stage}>
      <div
        className={styles.world}
        style={{ transform: `translate(-50%, -50%) scale(${fit})` }}
      >
        {/* city backdrop */}
        <div className={`${styles.city} ${dropping ? styles.cityDrop : ""}`}>
          <div className={styles.roadH} style={{ top: 180 }} />
          <div className={styles.roadH} style={{ top: 520 }} />
          <div className={styles.roadV} style={{ left: 220 }} />
          <div className={styles.roadV} style={{ left: 850 }} />
          <div className={styles.laneH} style={{ top: 204 }} />
          <div className={styles.laneH} style={{ top: 544 }} />

          <div
            className={`${styles.bldg} ${styles.cyan}`}
            style={{ left: 80, top: 60, width: 110, height: 84 }}
          >
            <span>PROJECTS</span>
          </div>
          <div
            className={`${styles.bldg} ${styles.pink}`}
            style={{ left: 330, top: 70, width: 130, height: 80 }}
          >
            <span>RESUME</span>
          </div>
          <div
            className={`${styles.bldg} ${styles.amber}`}
            style={{ left: 940, top: 60, width: 120, height: 88 }}
          >
            <span>ABOUT</span>
          </div>

          <div
            className={styles.park}
            style={{ left: 320, top: 290, width: 180, height: 160 }}
          >
            <span className={styles.parkName}>
              Kendall <i>Adkins</i>
            </span>
            <span className={styles.parkTag}>TERMINAL PARK</span>
          </div>

          <div
            className={styles.filler}
            style={{ left: 80, top: 300, width: 110, height: 120 }}
          />
          <div
            className={styles.filler}
            style={{ left: 640, top: 300, width: 130, height: 110 }}
          />
          <div
            className={styles.filler}
            style={{ left: 940, top: 300, width: 110, height: 130 }}
          />
          <div
            className={styles.filler}
            style={{ left: 90, top: 620, width: 140, height: 80 }}
          />
          <div
            className={styles.filler}
            style={{ left: 620, top: 620, width: 150, height: 80 }}
          />
          <div
            className={styles.filler}
            style={{ left: 940, top: 610, width: 120, height: 90 }}
          />

          <div
            className={`${styles.car} ${styles.carCyan}`}
            style={{ top: 196 }}
          />
          <div
            className={`${styles.car} ${styles.carAmber}`}
            style={{ top: 540 }}
          />
          <div
            className={`${styles.car} ${styles.carV} ${styles.carPink}`}
            style={{ left: 864 }}
          />
        </div>

        <div
          className={`${styles.dim} ${dropping ? styles.fade : ""}`}
          aria-hidden="true"
        />
        <div className={styles.scan} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />

        {/* HUD card — counter-scales up when the world is shrunk hard (mobile)
            so the card stays readable; a no-op on desktop where fit ≥ 0.62. */}
        <div
          className={`${styles.hud} ${dropping ? styles.hudDrop : ""}`}
          style={
            { "--hud-scale": fit < 0.62 ? 0.62 / fit : 1 } as CSSProperties
          }
        >
          <div className={styles.card}>
            <span
              className={`${styles.bk} ${styles.bkTL}`}
              aria-hidden="true"
            />
            <span
              className={`${styles.bk} ${styles.bkTR}`}
              aria-hidden="true"
            />
            <span
              className={`${styles.bk} ${styles.bkBL}`}
              aria-hidden="true"
            />
            <span
              className={`${styles.bk} ${styles.bkBR}`}
              aria-hidden="true"
            />

            <h1 className={styles.title}>
              {first} {last && <i>{last}</i>}
            </h1>

            <div className={styles.chips}>
              <Link
                href="/projects"
                className={`${styles.chip} ${styles.chipCyan}`}
              >
                PROJECTS
              </Link>
              <Link
                href="/resume"
                className={`${styles.chip} ${styles.chipPink}`}
              >
                RESUME
              </Link>
              <Link
                href="/about"
                className={`${styles.chip} ${styles.chipAmber}`}
              >
                ABOUT
              </Link>
            </div>

            <div className={styles.or}>
              <span className={styles.rule} />
              <span>OR</span>
              <span className={styles.rule} />
            </div>

            <button type="button" className={styles.descend} onClick={descend}>
              <span className={styles.descendDot} aria-hidden="true" />
              <span>descend into the city_</span>
            </button>
          </div>
        </div>

        {/* readouts */}
        <div className={styles.altitude}>
          {dropping ? (
            <span className={styles.dropping}>
              DESCENT IN PROGRESS
              <span className={styles.cursor} />
            </span>
          ) : (
            <span>ALTITUDE 400M · HOLDING</span>
          )}
        </div>
        <div className={styles.clock}>
          <span className={styles.clockDot} aria-hidden="true" />
          02:41 · NIGHT
        </div>
      </div>
    </div>
  );
}
