import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import PageShell from "./PageShell";
import PageTitle from "./PageTitle";
import ContactDispatch, { type SocialLink } from "./ContactDispatch";
import styles from "./aboutResidence.module.css";

type Polaroid = {
  title: string;
  caption: string;
  glyph: string;
  hue: number;
  chroma: number;
  tilt: string;
};

// Drawn from the real "outside of code" bio — placeholders for photos.
const POLAROIDS: Polaroid[] = [
  {
    title: "Bachata",
    caption: "Still learning. The best kind of homework.",
    glyph: "💃",
    hue: 340,
    chroma: 0.16,
    tilt: "-1.2deg",
  },
  {
    title: "Rollercoasters",
    caption: "Always chasing the next best drop.",
    glyph: "🎢",
    hue: 46,
    chroma: 0.14,
    tilt: "0.8deg",
  },
  {
    title: "Hot yoga",
    caption: "105° and zero unread notifications.",
    glyph: "🧘",
    hue: 190,
    chroma: 0.13,
    tilt: "-0.6deg",
  },
  {
    title: "Beach volleyball",
    caption: "A serve that's still a work in progress.",
    glyph: "🏐",
    hue: 300,
    chroma: 0.11,
    tilt: "1deg",
  },
  {
    title: "D&D + board games",
    caption: "A long-running campaign, good friends, bad dice.",
    glyph: "🎲",
    hue: 150,
    chroma: 0.15,
    tilt: "-0.9deg",
  },
];

export default function AboutResidence({
  name = "Kendall Adkins",
  story,
  portrait,
  socials,
}: {
  name?: string;
  story: ReactNode;
  portrait?: string;
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
        <div className={styles.polaroids}>
          {POLAROIDS.map((p) => (
            <div
              key={p.title}
              className={styles.polaroid}
              style={
                {
                  "--tilt": p.tilt,
                  "--ph": `oklch(0.84 ${p.chroma} ${p.hue})`,
                  "--ph-dim": `oklch(0.8 ${p.chroma} ${p.hue} / 0.35)`,
                  "--ph-glow": `oklch(0.7 ${p.chroma} ${p.hue} / 0.22)`,
                } as CSSProperties
              }
            >
              <div className={styles.polaroidPh}>
                <span className={styles.polaroidGlyph} aria-hidden="true">
                  {p.glyph}
                </span>
              </div>
              <h3 className={styles.polaroidTitle}>{p.title}</h3>
              <p className={styles.polaroidCap}>{p.caption}</p>
            </div>
          ))}
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
