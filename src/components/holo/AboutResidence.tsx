import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import PageShell from "./PageShell";
import PageTitle from "./PageTitle";
import ContactDispatch, { type SocialLink } from "./ContactDispatch";
import styles from "./aboutResidence.module.css";

export type ShelfCard = {
  title: string;
  caption: string;
  emoji: string;
  accent: string; // pink | amber | cyan | lavender | green
};

// named accents → oklch hue/chroma (mirrors the global neon palette)
const ACCENT: Record<string, { hue: number; chroma: number }> = {
  pink: { hue: 340, chroma: 0.16 },
  amber: { hue: 46, chroma: 0.14 },
  cyan: { hue: 190, chroma: 0.13 },
  lavender: { hue: 300, chroma: 0.11 },
  green: { hue: 150, chroma: 0.15 },
};
// scattered-photo tilts, applied by position so the shelf stays lively
const TILTS = ["-1.2deg", "0.8deg", "-0.6deg", "1deg", "-0.9deg"];

export default function AboutResidence({
  name = "Kendall Adkins",
  story,
  portrait,
  shelf,
  shelfIntro,
  socials,
}: {
  name?: string;
  story: ReactNode;
  portrait?: string;
  shelf: ShelfCard[];
  shelfIntro?: ReactNode;
  socials?: SocialLink[];
}) {
  return (
    <PageShell active="about" name={name}>
      <PageTitle
        hue="amber"
        kicker="✦ NEON CITY HOUSING · RESIDENT 4B"
        door="DOOR 03 / 03"
        title={
          <>
            Come on <i>in</i>.
          </>
        }
        sub="THE HUMAN ONE · SHOES OFF · DOOR'S UNLOCKED"
      />

      {/* origin story + portrait */}
      <div className={styles.storyGrid}>
        <div className={styles.prose}>{story}</div>

        <div className={styles.portraitWrap}>
          <div className={styles.portraitFrame}>
            <span
              className={`${styles.pBk} ${styles.pTl}`}
              aria-hidden="true"
            />
            <span
              className={`${styles.pBk} ${styles.pBr}`}
              aria-hidden="true"
            />
            <div className={styles.portraitPh}>
              {portrait ? (
                <Image
                  src={portrait}
                  alt={`Portrait of ${name}`}
                  fill
                  sizes="340px"
                  className={styles.portraitImg}
                  priority
                />
              ) : (
                <span className={styles.phLabel}>PORTRAIT · 4B</span>
              )}
            </div>
          </div>
          <div className={styles.portraitCap}>
            <span>UNIT 4B · THE TOWER</span>
            <span>EST. BALTIMORE</span>
          </div>
        </div>
      </div>

      {/* shelf */}
      <div className={styles.shelf}>
        <div className={styles.shelfRule}>
          <span className={styles.shelfLabel}>
            ✦ ON THE SHELF · LIFE OUTSIDE THE CODE
          </span>
          <span className={styles.shelfHair} aria-hidden="true" />
        </div>
        {shelfIntro && <div className={styles.shelfIntro}>{shelfIntro}</div>}
        <div className={styles.polaroids}>
          {shelf.map((p, i) => {
            const acc = ACCENT[p.accent] ?? ACCENT.cyan;
            return (
              <div
                key={`${p.title}-${i}`}
                className={styles.polaroid}
                style={
                  {
                    "--tilt": TILTS[i % TILTS.length],
                    "--ph": `oklch(0.84 ${acc.chroma} ${acc.hue})`,
                    "--ph-dim": `oklch(0.8 ${acc.chroma} ${acc.hue} / 0.35)`,
                    "--ph-glow": `oklch(0.7 ${acc.chroma} ${acc.hue} / 0.22)`,
                  } as CSSProperties
                }
              >
                <div className={styles.polaroidPh}>
                  <span className={styles.polaroidGlyph} aria-hidden="true">
                    {p.emoji}
                  </span>
                </div>
                <h3 className={styles.polaroidTitle}>{p.title}</h3>
                <p className={styles.polaroidCap}>{p.caption}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* closing + contact */}
      <div className={styles.closing}>
        That&apos;s the whole apartment.{" "}
        <i>Want to build something together?</i>
      </div>

      <div className={styles.contactWrap} id="about-contact">
        <ContactDispatch socials={socials} />
      </div>
      <div className={styles.footer}>
        © 2026 KENDALL ADKINS · NEON CITY HOUSING · APT 4B
      </div>
    </PageShell>
  );
}
