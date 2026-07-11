"use client";

import { useState } from "react";
import { FAST_TRAVEL_ITEMS } from "@/lib/cityFastTravel";
import HueDot from "./HueDot";
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
          {FAST_TRAVEL_ITEMS.map((it) => (
            <button
              key={it.key}
              type="button"
              className={`${styles.item} ${it.key !== "home" && activeKey === it.key ? styles.active : ""}`}
              onClick={() => {
                setOpen(false);
                onTravel(it.key);
              }}
            >
              {it.hue !== null && (
                <HueDot hue={it.hue} className={styles.dot} />
              )}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
