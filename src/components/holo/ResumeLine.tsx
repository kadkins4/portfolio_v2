"use client";

import { useState, type CSSProperties } from "react";
import PageShell from "./PageShell";
import PageTitle from "./PageTitle";
import ContactDispatch, { type SocialLink } from "./ContactDispatch";
import styles from "./resumeLine.module.css";

export type Station = {
  dates: string;
  role: string;
  org: string;
  detail?: string;
  bullets: string[];
  tech: string[];
  origin?: boolean;
  hue: number;
  chroma: number;
};

export type SkillGroup = {
  label: string;
  hue: number;
  chroma: number;
  items: string[];
};

function eraVars(hue: number, chroma: number): CSSProperties {
  return {
    "--era": `oklch(0.84 ${chroma} ${hue})`,
    "--era-dim": `oklch(0.8 ${chroma} ${hue} / 0.32)`,
    "--era-glow": `oklch(0.78 ${chroma} ${hue} / 0.7)`,
    "--era-bg": `oklch(0.72 ${chroma} ${hue} / 0.06)`,
  } as CSSProperties;
}

export default function ResumeLine({
  name = "Kendall Adkins",
  bio,
  resumePdf,
  experienceLabel,
  skillGroups,
  stations,
  socials,
}: {
  name?: string;
  bio: string;
  resumePdf: string;
  experienceLabel: string;
  skillGroups: SkillGroup[];
  stations: Station[];
  socials?: SocialLink[];
}) {
  // single open station; first one open by default
  const [openRow, setOpenRow] = useState<number | null>(0);

  return (
    <PageShell active="resume" name={name}>
      <PageTitle
        hue="cyan"
        kicker="✦ NEON CITY TRANSIT · CAREER SERVICE"
        door="DOOR 02 / 03"
        title={
          <>
            The Adkins <i>Line</i>
          </>
        }
        sub="NORTHBOUND · MOST RECENT FIRST · EVERY STATION EXPANDS"
      />

      <p className={styles.lede}>
        One line, most recent first. Each station is a stop I actually worked;
        tap any of them to see what shipped.
      </p>

      <div className={styles.layout}>
        {/* ---------- LEFT: the ticket ---------- */}
        <div className={styles.railWrap}>
          <div className={styles.ticket}>
            <span
              className={`${styles.tkBk} ${styles.tkTl}`}
              aria-hidden="true"
            />
            <span
              className={`${styles.tkBk} ${styles.tkBr}`}
              aria-hidden="true"
            />
            <span
              className={`${styles.notch} ${styles.notchL}`}
              aria-hidden="true"
            />
            <span
              className={`${styles.notch} ${styles.notchR}`}
              aria-hidden="true"
            />

            <div className={styles.tkHead}>
              <span>✦ TICKET</span>
              <span>NO. KA-2017-001</span>
            </div>

            <h2 className={styles.tkName}>
              Kendall <i>Adkins</i>
            </h2>
            <p className={styles.tkBio}>{bio}</p>

            <div className={styles.specRow}>
              <span className={styles.specLabel}>EXPERIENCE</span>
              <span className={styles.specVal}>{experienceLabel}</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>CORE STACK</span>
              <span className={`${styles.specVal} ${styles.specValCyan}`}>
                react / ts / next
              </span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>STATUS</span>
              <span className={`${styles.specVal} ${styles.specValGreen}`}>
                ● OPEN TO INTERESTING
              </span>
            </div>

            <div className={styles.groups}>
              {skillGroups.map((g) => (
                <div
                  key={g.label}
                  className={styles.group}
                  style={
                    {
                      "--gh": `oklch(0.84 ${g.chroma} ${g.hue})`,
                      "--gh-dim": `oklch(0.8 ${g.chroma} ${g.hue} / 0.35)`,
                    } as CSSProperties
                  }
                >
                  <div className={styles.groupHead}>{g.label}</div>
                  <div className={styles.groupChips}>
                    {g.items.map((it) => (
                      <span key={it} className={styles.gchip}>
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <a href={resumePdf} download className={styles.download}>
              ⇩ punch ticket · resume.pdf
            </a>
            <div className={styles.barcode} aria-hidden="true" />
            <div className={styles.finePrint}>
              PDF · UPDATED 2026.07 · ATS-FRIENDLY
            </div>
          </div>
        </div>

        {/* ---------- RIGHT: the timeline ---------- */}
        <div className={styles.timeline}>
          <div className={styles.line} aria-hidden="true" />
          <div className={styles.signalStrip} aria-hidden="true">
            <div className={styles.signal} />
          </div>

          {stations.map((s, i) => {
            const open = openRow === i;
            return (
              <div
                key={`${s.org}-${i}`}
                className={styles.station}
                style={eraVars(s.hue, s.chroma)}
              >
                <span className={styles.node} aria-hidden="true" />
                <button
                  type="button"
                  className={`${styles.card} ${open ? styles.cardOpen : ""}`}
                  aria-expanded={open}
                  onClick={() => setOpenRow(open ? null : i)}
                >
                  <div className={styles.stHead}>
                    <span className={styles.stDates}>{s.dates}</span>
                    <span className={styles.stRole}>{s.role}</span>
                    <span className={styles.stOrg}>{s.org}</span>
                    {s.origin && (
                      <span className={styles.originBadge}>ORIGIN</span>
                    )}
                    <span className={styles.chev} aria-hidden="true">
                      {open ? "▾" : "▸"}
                    </span>
                  </div>

                  {open && (
                    <div className={styles.stBody}>
                      {s.detail && <p className={styles.detail}>{s.detail}</p>}
                      {s.bullets.length > 0 && (
                        <ul className={styles.bullets}>
                          {s.bullets.map((b, bi) => (
                            <li key={bi} className={styles.bullet}>
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                      {s.tech.length > 0 && (
                        <div className={styles.transfers}>
                          <span className={styles.transfersLabel}>
                            TRANSFERS:
                          </span>
                          {s.tech.map((t) => (
                            <span key={t} className={styles.tchip}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              </div>
            );
          })}

          <div className={styles.endCap}>
            ● END OF LINE · ALL STATIONS ACCOUNTED FOR
          </div>
        </div>
      </div>

      <div className={styles.contactWrap}>
        <ContactDispatch socials={socials} />
      </div>
      <div className={styles.footer}>
        © 2026 KENDALL ADKINS · NEON CITY TRANSIT
      </div>
    </PageShell>
  );
}
