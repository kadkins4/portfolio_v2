import type { CSSProperties, ReactNode } from "react";
import styles from "./pageTitle.module.css";

export type TitleHue = "cyan" | "amber" | "pink" | "lavender";

const HUES: Record<TitleHue, { accent: string; split: string; kick: string }> =
  {
    cyan: {
      accent: "var(--cyan)",
      split: "oklch(0.85 0.13 190 / 0.45)",
      kick: "oklch(0.84 0.1 190 / 0.6)",
    },
    amber: {
      accent: "var(--amber)",
      split: "oklch(0.84 0.14 46 / 0.45)",
      kick: "oklch(0.84 0.14 46 / 0.7)",
    },
    pink: {
      // pink pages fall back to a cyan left-split so the aberration stays two-toned
      accent: "var(--pink)",
      split: "oklch(0.85 0.13 190 / 0.45)",
      kick: "oklch(0.8 0.15 340 / 0.7)",
    },
    lavender: {
      accent: "var(--lavender)",
      split: "oklch(0.85 0.13 190 / 0.45)",
      kick: "oklch(0.8 0.11 300 / 0.7)",
    },
  };

// Shared page title block: a mono kicker (with an optional dimmed DOOR badge),
// a chromatic-aberration serif h1, and a mono sub-kicker with a blinking cursor.
// `title`/`kicker` accept nodes so pages can italicize accent words.
export default function PageTitle({
  kicker,
  door,
  title,
  sub,
  hue = "cyan",
}: {
  kicker: ReactNode;
  door?: string;
  title: ReactNode;
  sub: ReactNode;
  hue?: TitleHue;
}) {
  const h = HUES[hue];
  return (
    <div
      className={styles.wrap}
      style={
        {
          "--pt-accent": h.accent,
          "--pt-split": h.split,
          "--pt-kick": h.kick,
        } as CSSProperties
      }
    >
      <div className={styles.kicker}>
        <span>{kicker}</span>
        {door && <span className={styles.door}>{door}</span>}
      </div>
      <h1 className={styles.h1}>{title}</h1>
      <div className={styles.sub}>
        {sub}
        <span className={styles.cursor} aria-hidden="true" />
      </div>
    </div>
  );
}
