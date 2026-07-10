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
